import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from data.loader import load_stock_data

def bollinger_bands_strategy(df: pd.DataFrame, 
                              period: int = 20, 
                              std_dev: float = 2.0) -> pd.DataFrame:
    """
    Bollinger Bands стратегия
    
    Идея:
    - Считаем скользящую среднюю (MA20)
    - Рисуем верхнюю и нижнюю полосы на расстоянии 2 стандартных отклонения
    - Цена редко выходит за полосы — когда выходит, скоро вернётся
    
    Сигналы:
    - Цена касается нижней полосы = КУПИТЬ (перепродана)
    - Цена касается верхней полосы = ПРОДАТЬ (перекуплена)
    """
    df = df.copy()
    
    df["MA"] = df["Close"].rolling(window=period).mean()
    df["STD"] = df["Close"].rolling(window=period).std()
    df["Upper"] = df["MA"] + (std_dev * df["STD"])
    df["Lower"] = df["MA"] - (std_dev * df["STD"])
    
    # Ширина полос — показывает волатильность
    df["Band_Width"] = (df["Upper"] - df["Lower"]) / df["MA"] * 100
    
    # %B — где цена внутри полос (0 = нижняя, 1 = верхняя)
    df["Percent_B"] = (df["Close"] - df["Lower"]) / (df["Upper"] - df["Lower"])
    
    df["Signal"] = 0
    df["Position"] = 0.0
    
    for i in range(1, len(df)):
        if pd.isna(df["Upper"].iloc[i]):
            continue
        # Цена пробила нижнюю полосу = покупаем
        if (df["Close"].iloc[i-1] > df["Lower"].iloc[i-1] and 
            df["Close"].iloc[i] <= df["Lower"].iloc[i]):
            df.iloc[i, df.columns.get_loc("Signal")] = 1
            df.iloc[i, df.columns.get_loc("Position")] = 2
        # Цена пробила верхнюю полосу = продаём
        elif (df["Close"].iloc[i-1] < df["Upper"].iloc[i-1] and 
              df["Close"].iloc[i] >= df["Upper"].iloc[i]):
            df.iloc[i, df.columns.get_loc("Signal")] = -1
            df.iloc[i, df.columns.get_loc("Position")] = -2
    
    return df

def plot_bollinger(ticker: str = "AAPL", period: str = "2y"):
    df = load_stock_data(ticker, period)
    df = bollinger_bands_strategy(df)
    
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10), sharex=True)
    
    # График цены с полосами
    ax1.plot(df.index, df["Close"], color="white", linewidth=1.5, label="Цена", zorder=3)
    ax1.plot(df.index, df["MA"], color="yellow", linewidth=1, label="MA20", linestyle="--")
    ax1.plot(df.index, df["Upper"], color="#ef4444", linewidth=1, label="Верхняя полоса")
    ax1.plot(df.index, df["Lower"], color="#22c55e", linewidth=1, label="Нижняя полоса")
    ax1.fill_between(df.index, df["Upper"], df["Lower"], alpha=0.1, color="#38bdf8")
    
    buy_signals = df[df["Position"] == 2]
    sell_signals = df[df["Position"] == -2]
    ax1.scatter(buy_signals.index, buy_signals["Close"],
                marker="^", color="#22c55e", s=120, zorder=5, label="Купить")
    ax1.scatter(sell_signals.index, sell_signals["Close"],
                marker="v", color="#ef4444", s=120, zorder=5, label="Продать")
    
    ax1.set_facecolor("#0f172a")
    ax1.set_title(f"{ticker} — Bollinger Bands", color="white")
    ax1.set_ylabel("Цена ($)", color="white")
    ax1.tick_params(colors="white")
    ax1.legend(fontsize=9)
    ax1.grid(True, alpha=0.2)
    
    # График %B
    ax2.plot(df.index, df["Percent_B"], color="#a855f7", linewidth=1.5, label="%B")
    ax2.axhline(y=1, color="#ef4444", linestyle="--", alpha=0.7, label="Верхняя полоса (1.0)")
    ax2.axhline(y=0, color="#22c55e", linestyle="--", alpha=0.7, label="Нижняя полоса (0.0)")
    ax2.axhline(y=0.5, color="gray", linestyle="--", alpha=0.5, label="Середина (0.5)")
    ax2.fill_between(df.index, df["Percent_B"], 1,
                     where=df["Percent_B"] >= 1, color="#ef4444", alpha=0.3)
    ax2.fill_between(df.index, df["Percent_B"], 0,
                     where=df["Percent_B"] <= 0, color="#22c55e", alpha=0.3)
    ax2.set_facecolor("#0f172a")
    ax2.set_ylabel("%B", color="white")
    ax2.set_xlabel("Дата", color="white")
    ax2.tick_params(colors="white")
    ax2.legend(fontsize=9)
    ax2.grid(True, alpha=0.2)
    
    fig.patch.set_facecolor("#0f172a")
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    plot_bollinger("AAPL", "2y")