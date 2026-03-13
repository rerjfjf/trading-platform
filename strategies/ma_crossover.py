import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import matplotlib.pyplot as plt
from data.loader import load_stock_data

def ma_crossover_strategy(df: pd.DataFrame, short: int = 20, long: int = 50) -> pd.DataFrame:
    """
    Moving Average Crossover стратегия
    Идея простая:
    - Считаем короткую среднюю (20 дней) и длинную (50 дней)
    - Когда короткая пересекает длинную снизу вверх = сигнал КУПИТЬ
    - Когда короткая пересекает длинную сверху вниз = сигнал ПРОДАТЬ
    """
    df = df.copy()
    
    # Считаем скользящие средние
    df["MA_short"] = df["Close"].rolling(window=short).mean()
    df["MA_long"] = df["Close"].rolling(window=long).mean()
    
    # Определяем сигналы
    df["Signal"] = 0
    df.loc[df["MA_short"] > df["MA_long"], "Signal"] = 1   # держим акцию
    df.loc[df["MA_short"] < df["MA_long"], "Signal"] = -1  # не держим
    
    # Находим точки пересечения
    df["Position"] = df["Signal"].diff()
    
    return df

def plot_strategy(ticker: str = "AAPL", period: str = "2y"):
    df = load_stock_data(ticker, period)
    df = ma_crossover_strategy(df)
    
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10), sharex=True)
    
    # График цены и средних
    ax1.plot(df.index, df["Close"], label="Цена", linewidth=1.5, color="gray")
    ax1.plot(df.index, df["MA_short"], label="MA 20 дней", linewidth=1.5, color="blue")
    ax1.plot(df.index, df["MA_long"], label="MA 50 дней", linewidth=1.5, color="orange")
    
    # Точки входа (покупка)
    buy_signals = df[df["Position"] == 2]
    ax1.scatter(buy_signals.index, buy_signals["Close"], 
                marker="^", color="green", s=100, zorder=5, label="Купить")
    
    # Точки выхода (продажа)
    sell_signals = df[df["Position"] == -2]
    ax1.scatter(sell_signals.index, sell_signals["Close"], 
                marker="v", color="red", s=100, zorder=5, label="Продать")
    
    ax1.set_title(f"{ticker} — стратегия MA Crossover")
    ax1.set_ylabel("Цена ($)")
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # График сигнала
    ax2.plot(df.index, df["Signal"], color="purple", linewidth=1)
    ax2.fill_between(df.index, df["Signal"], 0, 
                     where=df["Signal"] > 0, color="green", alpha=0.3, label="В позиции")
    ax2.fill_between(df.index, df["Signal"], 0, 
                     where=df["Signal"] < 0, color="red", alpha=0.3, label="Вне позиции")
    ax2.set_ylabel("Сигнал")
    ax2.set_xlabel("Дата")
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    plot_strategy("AAPL", "2y")