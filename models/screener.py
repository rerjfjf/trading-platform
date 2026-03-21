import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import pandas as pd
from data.loader import load_stock_data
from concurrent.futures import ThreadPoolExecutor, as_completed

# Топ акции для скрининга
SP500_TICKERS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BRK-B",
    "UNH", "JNJ", "JPM", "V", "PG", "MA", "HD", "CVX", "MRK", "ABBV",
    "PEP", "KO", "AVGO", "COST", "WMT", "BAC", "DIS", "CSCO", "ACN",
    "MCD", "ABT", "TMO", "NEE", "NKE", "TXN", "PM", "LIN", "ORCL",
    "DHR", "UPS", "MS", "RTX", "ADBE", "NFLX", "INTC", "AMD", "QCOM",
    "BTC-USD", "ETH-USD", "SOL-USD"
]

def get_stock_metrics(ticker: str, period: str = "1y") -> dict:
    """Считаем метрики для одной акции"""
    try:
        df = load_stock_data(ticker, period)
        if len(df) < 50:
            return None
            
        returns = df["Close"].pct_change().dropna()
        
        total_return = (df["Close"].iloc[-1] / df["Close"].iloc[0] - 1) * 100
        volatility = returns.std() * np.sqrt(252) * 100
        sharpe = (returns.mean() / returns.std()) * np.sqrt(252) if returns.std() > 0 else 0
        max_dd = ((df["Close"] / df["Close"].cummax()) - 1).min() * 100
        current_price = df["Close"].iloc[-1]
        
        # RSI
        delta = df["Close"].diff()
        gain = delta.where(delta > 0, 0).rolling(14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
        rs = gain / loss
        rsi = float((100 - (100 / (1 + rs))).iloc[-1])
        
        # MA сигнал
        ma20 = df["Close"].rolling(20).mean().iloc[-1]
        ma50 = df["Close"].rolling(50).mean().iloc[-1]
        ma_signal = "BULLISH" if ma20 > ma50 else "BEARISH"
        
        result = {
            "ticker": ticker,
            "price": round(float(current_price), 2),
            "return_1y": round(float(total_return), 2),
            "volatility": round(float(volatility), 2),
            "sharpe": round(float(sharpe), 2),
            "max_drawdown": round(float(max_dd), 2),
            "rsi": round(rsi, 1),
            "ma_signal": ma_signal,
        }

        # Проверяем на nan
        import math
        for k, v in result.items():
            if isinstance(v, float) and math.isnan(v):
                return None

        return result
    except:
        return None

def screen_stocks(
    min_return: float = None,
    max_volatility: float = None,
    min_sharpe: float = None,
    max_rsi: float = None,
    min_rsi: float = None,
    ma_signal: str = None,
    tickers: list = None,
    period: str = "1y"
) -> list:
    """
    Скринер акций по параметрам
    """
    stocks = tickers or SP500_TICKERS
    results = []
    
    print(f"Сканируем {len(stocks)} акций...")
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(get_stock_metrics, t, period): t for t in stocks}
        for future in as_completed(futures):
            metrics = future.result()
            if metrics:
                results.append(metrics)
    
    # Фильтрация
    filtered = results
    
    if min_return is not None:
        filtered = [s for s in filtered if s["return_1y"] >= min_return]
    if max_volatility is not None:
        filtered = [s for s in filtered if s["volatility"] <= max_volatility]
    if min_sharpe is not None:
        filtered = [s for s in filtered if s["sharpe"] >= min_sharpe]
    if max_rsi is not None:
        filtered = [s for s in filtered if s["rsi"] <= max_rsi]
    if min_rsi is not None:
        filtered = [s for s in filtered if s["rsi"] >= min_rsi]
    if ma_signal is not None:
        filtered = [s for s in filtered if s["ma_signal"] == ma_signal.upper()]
    
    # Сортируем по Sharpe
    filtered.sort(key=lambda x: x["sharpe"], reverse=True)
    
    return filtered

if __name__ == "__main__":
    print("Ищем акции с RSI < 35 (перепроданные)...")
    results = screen_stocks(max_rsi=35, min_sharpe=0.3)
    print(f"\nНайдено: {len(results)} акций\n")
    for s in results:
        print(f"{s['ticker']:<10} RSI:{s['rsi']:<6} Sharpe:{s['sharpe']:<6} Return:{s['return_1y']}%")