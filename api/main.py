import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import urllib.request
import json as json_lib
from fastapi import FastAPI, Header, HTTPException

AUTH_SERVICE = "http://localhost:3001/auth"

def get_current_user(authorization: str = None):
    if not authorization:
        return None
    try:
        token = authorization.replace("Bearer ", "")
        data = json_lib.dumps({"token": token}).encode()
        req = urllib.request.Request(
            f"{AUTH_SERVICE}/verify",
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req) as response:
            result = json_lib.loads(response.read())
            if result.get("valid"):
                return result
        return None
    except:
        return None

def check_plan(user_data: dict, feature: str) -> bool:
    """Проверяем доступ к фиче по плану"""
    if not user_data:
        return False
    limits = user_data.get("limits", {})
    features = limits.get("features", [])
    return "all" in features or feature in features

from database.crud import save_backtest, get_backtest_history, save_portfolio, add_to_watchlist, get_watchlist
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from data.loader import load_stock_data
from strategies.ma_crossover import ma_crossover_strategy
from strategies.rsi import rsi_strategy
from strategies.macd import macd_strategy
from strategies.bollinger_bands import bollinger_bands_strategy
from backtest.engine import BacktestEngine
from models.black_scholes import black_scholes, calculate_greeks
from models.portfolio import optimize_portfolio


app = FastAPI(title="Trading Platform API", version="1.0.0")

# Разрешаем запросы с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Модели запросов ---

class BacktestRequest(BaseModel):
    ticker: str = "AAPL"
    period: str = "2y"
    strategy: str = "rsi"  # "rsi" или "ma"

class BlackScholesRequest(BaseModel):
    S: float = 257.0      # цена акции
    K: float = 260.0      # страйк
    T: float = 0.5        # время в годах
    r: float = 0.05       # ставка
    sigma: float = 0.25   # волатильность

class PortfolioRequest(BaseModel):
    tickers: List[str] = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN"]
    period: str = "2y"
    simulations: int = 3000

class MonteCarloRequest(BaseModel):
    ticker: str = "AAPL"
    days: int = 126
    simulations: int = 1000

# --- Эндпоинты ---

@app.get("/")
def root():
    return {"message": "Trading Platform API работает 🚀"}

@app.get("/stock/{ticker}")
def get_stock(ticker: str, period: str = "1y"):
    """Получить данные акции"""
    df = load_stock_data(ticker, period)
    return {
        "ticker": ticker,
        "period": period,
        "records": len(df),
        "latest_price": round(df["Close"].iloc[-1], 2),
        "change_1y": round((df["Close"].iloc[-1] / df["Close"].iloc[0] - 1) * 100, 2),
    }

@app.post("/backtest")
def run_backtest(req: BacktestRequest, authorization: str = Header(None)):
    user_data = get_current_user(authorization)
    
    if not user_data:
        raise HTTPException(status_code=401, detail="Требуется авторизация")
    
    if not check_plan(user_data, "backtest"):
        raise HTTPException(status_code=403, detail="Обновите план для доступа")
    
    allowed_strategies = user_data.get("limits", {}).get("strategies", [])
    if req.strategy not in allowed_strategies:
        raise HTTPException(status_code=403, detail=f"Стратегия {req.strategy} недоступна на вашем плане")

    import rust_engine as re

    df = load_stock_data(req.ticker, req.period)
    
    if req.strategy == "rsi":
        df = rsi_strategy(df)
    elif req.strategy == "macd":
        df = macd_strategy(df)
    elif req.strategy == "bollinger":
        df = bollinger_bands_strategy(df)
    else:
        df = ma_crossover_strategy(df)

    closes = df["Close"].tolist()
    signals = df["Position"].fillna(0).astype(int).tolist()

    final_capital, total_return, max_drawdown, total_trades = re.run_backtest(
        10000.0, closes, signals
    )

    returns = df["Close"].pct_change().dropna()
    sharpe = round(float(returns.mean() / returns.std() * (252 ** 0.5)), 2) if returns.std() > 0 else 0

    save_backtest(
        ticker=req.ticker,
        strategy=req.strategy,
        period=req.period,
        initial_capital=10000,
        final_capital=round(final_capital, 2),
        total_return=round(total_return, 2),
        sharpe_ratio=float(sharpe),
        max_drawdown=round(max_drawdown, 2),
        total_trades=total_trades
    )

    return {
        "ticker": req.ticker,
        "strategy": req.strategy,
        "initial_capital": 10000,
        "final_capital": round(final_capital, 2),
        "total_return": round(total_return, 2),
        "sharpe_ratio": sharpe,
        "max_drawdown": round(max_drawdown, 2),
        "total_trades": total_trades,
        "engine": "Rust 🦀"
    }

@app.post("/black-scholes")
def price_option(req: BlackScholesRequest):
    """Рассчитать цену опциона"""
    call = black_scholes(req.S, req.K, req.T, req.r, req.sigma, "call")
    put  = black_scholes(req.S, req.K, req.T, req.r, req.sigma, "put")
    greeks = calculate_greeks(req.S, req.K, req.T, req.r, req.sigma)
    
    return {
        "call_price": call,
        "put_price": put,
        "greeks": greeks
    }

@app.post("/portfolio/optimize")
def optimize(req: PortfolioRequest):
    """Оптимизировать портфель"""
    data = optimize_portfolio(req.tickers, req.period, req.simulations)
    
    weights = {
        ticker: round(weight * 100, 1)
        for ticker, weight in zip(data["tickers"], data["best_weights"])
    }
    
    return {
        "weights": weights,
        "expected_return": data["best_return"],
        "risk": data["best_risk"],
        "sharpe_ratio": data["best_sharpe"]
    }

@app.post("/monte-carlo")
def run_monte_carlo(req: MonteCarloRequest):
    """Запустить Monte Carlo симуляцию"""
    from models.monte_carlo import monte_carlo_simulation
    data = monte_carlo_simulation(req.ticker, req.days, req.simulations)
    return {
        "ticker": data["ticker"],
        "last_price": round(data["last_price"], 2),
        "days": data["days"],
        "percentile_5":  data["percentile_5"],
        "percentile_25": data["percentile_25"],
        "percentile_50": data["percentile_50"],
        "percentile_75": data["percentile_75"],
        "percentile_95": data["percentile_95"],
        "prob_profit":   data["prob_profit"],
    }


class LSTMRequest(BaseModel):
    ticker: str = "AAPL"
    period: str = "5y"
    epochs: int = 50
    predict_days: int = 30

@app.post("/lstm")
def run_lstm(req: LSTMRequest):
    """Предсказание цены через LSTM нейросеть"""
    from models.lstm import train_and_predict
    data = train_and_predict(req.ticker, req.period, epochs=req.epochs, predict_days=req.predict_days)
    return {
        "ticker": data["ticker"],
        "last_price": round(data["last_price"], 2),
        "predicted_price_30d": round(data["predicted_price_30d"], 2),
        "change_30d": data["change_30d"],
        "future_prices": [round(p, 2) for p in data["future_prices"].tolist()]
    }


@app.get("/history")
def get_history(ticker: str = None):
    """История бэктестов"""
    return get_backtest_history(ticker)

@app.post("/watchlist/{ticker}")
def add_watchlist(ticker: str, notes: str = None):
    """Добавить акцию в вотчлист"""
    success = add_to_watchlist(ticker, notes)
    return {"success": success, "ticker": ticker}

@app.get("/watchlist")
def get_watchlist_endpoint():
    """Получить вотчлист"""
    return get_watchlist()



@app.delete("/watchlist/{ticker}")
def remove_watchlist(ticker: str):
    """Удалить акцию из вотчлиста"""
    from database.crud import remove_from_watchlist
    success = remove_from_watchlist(ticker)
    return {"success": success, "ticker": ticker}


@app.get("/compare/{ticker1}/{ticker2}")
def compare_stocks_endpoint(ticker1: str, ticker2: str, period: str = "1y"):
    """Сравнение двух акций"""
    from models.comparison import compare_stocks
    return compare_stocks(ticker1, ticker2, period)


@app.get("/dividends/{ticker}")
def get_dividends(ticker: str):
    """История дивидендов акции"""
    import yfinance as yf
    stock = yf.Ticker(ticker)
    divs = stock.dividends
    
    if divs.empty:
        return {"ticker": ticker, "dividends": [], "total_annual": 0}
    
    # Последние 3 года
    divs.index = divs.index.tz_localize(None) if divs.index.tz else divs.index
    recent = divs[divs.index.year >= 2022]
    
    # Годовые выплаты
    annual = recent.groupby(recent.index.year).sum().to_dict()
    
    return {
        "ticker": ticker,
        "dividends": [
            {"date": str(d.date()), "amount": round(float(v), 4)}
            for d, v in recent.items()
        ],
        "annual_totals": {str(k): round(float(v), 4) for k, v in annual.items()},
        "latest_dividend": round(float(divs.iloc[-1]), 4) if not divs.empty else 0,
        "total_paid_3y": round(float(recent.sum()), 4)
    }



@app.get("/news/{ticker}")
def get_news(ticker: str):
    """Последние новости по акции"""
    import yfinance as yf
    stock = yf.Ticker(ticker)
    news = stock.news
    
    if not news:
        return {"ticker": ticker, "news": []}
    
    return {
        "ticker": ticker,
        "news": [
            {
                "title": n.get("content", {}).get("title", ""),
                "summary": n.get("content", {}).get("summary", ""),
                "url": n.get("content", {}).get("canonicalUrl", {}).get("url", ""),
                "published": n.get("content", {}).get("pubDate", ""),
                "source": n.get("content", {}).get("provider", {}).get("displayName", "")
            }
            for n in news[:10]
        ]
    }



@app.get("/best-strategy/{ticker}")
def find_best_strategy(ticker: str, period: str = "2y"):
    """Автоматически находит лучшую стратегию для акции"""
    import rust_engine as re
    from strategies.bollinger_bands import bollinger_bands_strategy

    df = load_stock_data(ticker, period)
    
    strategies = {
        "RSI": rsi_strategy(df.copy()),
        "MA Crossover": ma_crossover_strategy(df.copy()),
        "MACD": macd_strategy(df.copy()),
        "Bollinger Bands": bollinger_bands_strategy(df.copy()),
    }
    
    results = {}
    for name, df_strat in strategies.items():
        try:
            closes = df_strat["Close"].tolist()
            signals = df_strat["Position"].fillna(0).astype(int).tolist()
            final_capital, total_return, max_drawdown, total_trades = re.run_backtest(
                10000.0, closes, signals
            )
            returns = df_strat["Close"].pct_change().dropna()
            sharpe = float(returns.mean() / returns.std() * (252 ** 0.5)) if returns.std() > 0 else 0
            
            results[name] = {
                "total_return": round(float(total_return), 2),
                "sharpe_ratio": round(sharpe, 2),
                "max_drawdown": round(float(max_drawdown), 2),
                "total_trades": int(total_trades),
                "final_capital": round(float(final_capital), 2),
                "score": round(float(total_return) * 0.4 + sharpe * 30 - abs(float(max_drawdown)) * 0.3, 2)
            }
        except Exception as e:
            results[name] = {"error": str(e)}
    
    # Находим лучшую по score
    valid = {k: v for k, v in results.items() if "error" not in v}
    best = max(valid, key=lambda x: valid[x]["score"]) if valid else None
    
    return {
        "ticker": ticker,
        "period": period,
        "best_strategy": best,
        "results": results,
        "recommendation": f"Для {ticker} лучше всего работает {best} — score {valid[best]['score']}" if best else "Нет данных"
    }


@app.get("/stress-test/{ticker}")
def run_stress_test(ticker: str, portfolio_value: float = 10000):
    """Stress testing — поведение в исторических кризисах"""
    from models.stress_test import stress_test
    return stress_test(ticker, portfolio_value)






@app.post("/portfolio/track")
def track_portfolio(req: dict, authorization: str = Header(None)):
    """Трекер реального портфеля"""
    user_data = get_current_user(authorization)
    if not user_data:
        raise HTTPException(status_code=401, detail="Требуется авторизация")
    
    holdings = req.get("holdings", [])
    # holdings = [{"ticker": "AAPL", "shares": 10, "avg_price": 150.0}, ...]
    
    total_value = 0
    total_cost = 0
    positions = []
    
    for h in holdings:
        try:
            df = load_stock_data(h["ticker"], "1d")
            current_price = float(df["Close"].iloc[-1])
            shares = float(h["shares"])
            avg_price = float(h["avg_price"])
            
            value = current_price * shares
            cost = avg_price * shares
            pnl = value - cost
            pnl_pct = (current_price / avg_price - 1) * 100
            
            total_value += value
            total_cost += cost
            
            positions.append({
                "ticker": h["ticker"],
                "shares": shares,
                "avg_price": round(avg_price, 2),
                "current_price": round(current_price, 2),
                "value": round(value, 2),
                "cost": round(cost, 2),
                "pnl": round(pnl, 2),
                "pnl_pct": round(pnl_pct, 2),
            })
        except Exception as e:
            positions.append({
                "ticker": h["ticker"],
                "error": str(e)
            })
    
    total_pnl = total_value - total_cost
    total_pnl_pct = (total_value / total_cost - 1) * 100 if total_cost > 0 else 0
    
    return {
        "total_value": round(total_value, 2),
        "total_cost": round(total_cost, 2),
        "total_pnl": round(total_pnl, 2),
        "total_pnl_pct": round(total_pnl_pct, 2),
        "positions": positions
    }




@app.post("/portfolio/save")
def save_portfolio(req: dict, authorization: str = Header(None)):
    """Сохранить портфель пользователя"""
    user_data = get_current_user(authorization)
    if not user_data:
        raise HTTPException(status_code=401, detail="Требуется авторизация")
    
    from database.crud import save_portfolio_holdings
    user_id = user_data["user"]["id"]
    holdings = req.get("holdings", [])
    save_portfolio_holdings(user_id, holdings)
    return {"success": True, "message": "Портфель сохранён"}

@app.get("/portfolio/load")
def load_portfolio(authorization: str = Header(None)):
    """Загрузить портфель пользователя"""
    user_data = get_current_user(authorization)
    if not user_data:
        raise HTTPException(status_code=401, detail="Требуется авторизация")
    
    from database.crud import get_portfolio_holdings
    user_id = user_data["user"]["id"]
    holdings = get_portfolio_holdings(user_id)
    return {"holdings": holdings}


