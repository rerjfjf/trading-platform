import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import pandas as pd
from data.loader import load_stock_data

def compare_stocks(ticker1: str, ticker2: str, period: str = "1y") -> dict:
    """
    Сравниваем две акции по ключевым метрикам
    """
    df1 = load_stock_data(ticker1, period)
    df2 = load_stock_data(ticker2, period)

    def get_metrics(df, ticker):
        returns = df["Close"].pct_change().dropna()
        total_return = (df["Close"].iloc[-1] / df["Close"].iloc[0] - 1) * 100
        volatility = returns.std() * np.sqrt(252) * 100
        sharpe = (returns.mean() / returns.std()) * np.sqrt(252)
        max_dd = ((df["Close"] / df["Close"].cummax()) - 1).min() * 100
        current_price = df["Close"].iloc[-1]
        avg_volume = df["Volume"].mean() if "Volume" in df.columns else 0

        return {
            "ticker": ticker,
            "current_price": round(float(current_price), 2),
            "total_return": round(float(total_return), 2),
            "volatility": round(float(volatility), 2),
            "sharpe_ratio": round(float(sharpe), 2),
            "max_drawdown": round(float(max_dd), 2),
            "avg_volume": round(float(avg_volume)),
        }

    metrics1 = get_metrics(df1, ticker1)
    metrics2 = get_metrics(df2, ticker2)

    # Выравниваем даты
    df1.index = df1.index.tz_localize(None) if df1.index.tz else df1.index
    df2.index = df2.index.tz_localize(None) if df2.index.tz else df2.index
    common = df1.index.intersection(df2.index)
    
    # Нормализованные цены для графика (старт = 100)
    norm1 = (df1.loc[common, "Close"] / df1.loc[common, "Close"].iloc[0] * 100).tolist()
    norm2 = (df2.loc[common, "Close"] / df2.loc[common, "Close"].iloc[0] * 100).tolist()
    dates = [str(d.date()) for d in common]

    # Корреляция
    returns1 = df1.loc[common, "Close"].pct_change().dropna()
    returns2 = df2.loc[common, "Close"].pct_change().dropna()
    correlation = round(float(returns1.corr(returns2)), 3)

    return {
        "ticker1": metrics1,
        "ticker2": metrics2,
        "correlation": correlation,
        "dates": dates,
        "normalized1": [round(x, 2) for x in norm1],
        "normalized2": [round(x, 2) for x in norm2],
    }