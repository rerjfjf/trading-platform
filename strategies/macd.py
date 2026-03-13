import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from data.loader import load_stock_data

def macd_strategy(df: pd.DataFrame, 
                  fast: int = 12, 
                  slow: int = 26, 
                  signal: int = 9) -> pd.DataFrame:
    """
    MACD — Moving Average Convergence Divergence
    
    fast   - быстрая EMA (12 дней по умолчанию)
    slow   - медленная EMA (26 дней по умолчанию)
    signal - сигнальная линия (9 дней по умолчанию)
    
    Логика:
    - MACD = EMA(12) - EMA(26)
    - Signal = EMA(MACD, 9)
    - Когда MACD пересекает Signal снизу вверх = КУПИТЬ
    - Когда MACD пересекает Signal сверху вниз = ПРОДАТЬ
    """
    df = df.copy()
    
    # EMA — экспоненциальная скользящая средняя
    # В отличие от обычной MA, свежие данные весят больше
    df["EMA_fast"] = df["Close"].ewm(span=fast, adjust=False).mean()
    df["EMA_slow"] = df["Close"].ewm(span=slow, adjust=False).mean()
    
    df["MACD"] = df["EMA_fast"] - df["EMA_slow"]
    df["Signal_line"] = df["MACD"].ewm(span=signal, adjust=False).mean()
    df["Histogram"] = df["MACD"] - df["Signal_line"]
    
    # Сигналы
    df["Signal"] = 0
    df["Position"] = 0.0
    
    for i in range(1, len(df)):
        # MACD пересекает Signal снизу вверх = покупаем
        if (df["MACD"].iloc[i-1] < df["Signal_line"].iloc[i-1] and 
            df["MACD"].iloc[i] >= df["Signal_line"].iloc[i]):
            df.iloc[i, df.columns.get_loc("Signal")] = 1
            df.iloc[i, df.columns.get_loc("Position")] = 2
        # MACD пересекает Signal сверху вниз = продаём
        elif (df["MACD"].iloc[i-1] > df["Signal_line"].iloc[i-1] and 
              df["MACD"].iloc[i] <= df["Signal_line"].iloc[i]):
            df.iloc[i, df.columns.get_loc("Signal")] = -1
            df.iloc[i, df.columns.get_loc("Position")] = -2
    
    return df

def plot_macd(ticker: str = "AAPL", period: str = "2y"):
    df = load_stock_data(ticker, period)
    df = macd_strategy(df)
    
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10), sharex=True)
    
    # График цены
    ax1.plot(df.index, df["Close"], color="gray", linewidth=1.5, label="Цена")
    
    buy_signals = df[df["Position"] == 2]
    sell_signals = df[df["Position"] == -2]
    
    ax1.scatter(buy_signals.index, buy_signals["Close"],
                marker="^", color="green", s=120, zorder=5, label="Купить")
    ax1.scatter(sell_signals.index, sell_signals["Close"],
                marker="v", color="red", s=120, zorder=5, label="Продать")
    
    ax1.set_title(f"{ticker} — MACD стратегия")
    ax1.set_ylabel("Цена ($)")
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # График MACD
    ax2.plot(df.index, df["MACD"], color="#38bdf8", linewidth=1.5, label="MACD")
    ax2.plot(df.index, df["Signal_line"], color="orange", linewidth=1.5, label="Signal")
    
    # Гистограмма
    colors = ["#22c55e" if v >= 0 else "#ef4444" for v in df["Histogram"]]
    ax2.bar(df.index, df["Histogram"], color=colors, alpha=0.5, label="Histogram")
    ax2.axhline(y=0, color="white", linewidth=0.5, alpha=0.5)
    
    ax2.set_ylabel("MACD")
    ax2.set_xlabel("Дата")
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    plot_macd("AAPL", "2y")