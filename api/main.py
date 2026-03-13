import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from data.loader import load_stock_data
from strategies.ma_crossover import ma_crossover_strategy
from strategies.rsi import rsi_strategy
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
def run_backtest(req: BacktestRequest):
    """Запустить бэктест стратегии — использует Rust движок"""
    import rust_engine as re
    import numpy as np

    df = load_stock_data(req.ticker, req.period)
    
    if req.strategy == "rsi":
        df = rsi_strategy(df)
    elif req.strategy == "macd":
        from strategies.macd import macd_strategy
        df = macd_strategy(df)
    else:
        df = ma_crossover_strategy(df)

    closes = df["Close"].tolist()
    signals = df["Position"].fillna(0).astype(int).tolist()

    # Rust считает бэктест
    final_capital, total_return, max_drawdown, total_trades = re.run_backtest(
        10000.0, closes, signals
    )

    # Sharpe считаем на Python (пока)
    returns = df["Close"].pct_change().dropna()
    sharpe = round(returns.mean() / returns.std() * (252 ** 0.5), 2) if returns.std() > 0 else 0

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