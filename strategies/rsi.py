import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from data.loader import load_stock_data

def calculate_rsi(df: pd.DataFrame, period: int = 14) -> pd.DataFrame:
    """
    Считаем RSI (Relative Strength Index)
    period - период расчёта, стандарт 14 дней
    """
    df = df.copy()
    
    delta = df["Close"].diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)
    
    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()
    
    rs = avg_gain / avg_loss
    df["RSI"] = 100 - (100 / (1 + rs))
    
    return df

def rsi_strategy(df: pd.DataFrame, 
                 oversold: int = 30, 
                 overbought: int = 70) -> pd.DataFrame:
    """
    RSI стратегия
    oversold - уровень перепроданности (покупаем)
    overbought - уровень перекупленности (продаём)
    """
    df = calculate_rsi(df)
    
    df["Signal"] = 0
    df["Position"] = 0.0
    
    for i in range(1, len(df)):
        # Пересечение снизу вверх через 30 = покупаем
        if df["RSI"].iloc[i-1] < oversold and df["RSI"].iloc[i] >= oversold:
            df.iloc[i, df.columns.get_loc("Signal")] = 1
            df.iloc[i, df.columns.get_loc("Position")] = 2
        # Пересечение сверху вниз через 70 = продаём
        elif df["RSI"].iloc[i-1] > overbought and df["RSI"].iloc[i] <= overbought:
            df.iloc[i, df.columns.get_loc("Signal")] = -1
            df.iloc[i, df.columns.get_loc("Position")] = -2
    
    return df

def plot_rsi_strategy(ticker: str = "AAPL", period: str = "2y"):
    df = load_stock_data(ticker, period)
    df = rsi_strategy(df)
    
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10), sharex=True)
    
    # График цены
    ax1.plot(df.index, df["Close"], color="gray", linewidth=1.5, label="Цена")
    
    buy_signals = df[df["Position"] == 2]
    sell_signals = df[df["Position"] == -2]
    
    ax1.scatter(buy_signals.index, buy_signals["Close"],
                marker="^", color="green", s=120, zorder=5, label="Купить")
    ax1.scatter(sell_signals.index, sell_signals["Close"],
                marker="v", color="red", s=120, zorder=5, label="Продать")
    
    ax1.set_title(f"{ticker} — RSI стратегия")
    ax1.set_ylabel("Цена ($)")
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # График RSI
    ax2.plot(df.index, df["RSI"], color="purple", linewidth=1.5, label="RSI")
    ax2.axhline(y=70, color="red", linestyle="--", alpha=0.7, label="Перекуплен (70)")
    ax2.axhline(y=30, color="green", linestyle="--", alpha=0.7, label="Перепродан (30)")
    ax2.fill_between(df.index, df["RSI"], 70,
                     where=df["RSI"] >= 70, color="red", alpha=0.3)
    ax2.fill_between(df.index, df["RSI"], 30,
                     where=df["RSI"] <= 30, color="green", alpha=0.3)
    ax2.set_ylim(0, 100)
    ax2.set_ylabel("RSI")
    ax2.set_xlabel("Дата")
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    plot_rsi_strategy("AAPL", "2y")