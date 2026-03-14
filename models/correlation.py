import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
from data.loader import load_stock_data

def calculate_correlation(tickers: list, period: str = "2y") -> dict:
    prices = {}
    for ticker in tickers:
        df = load_stock_data(ticker, period)
        # Убираем timezone из индекса
        df.index = df.index.tz_localize(None) if df.index.tz is not None else df.index
        prices[ticker] = df["Close"]
    
    prices_df = pd.DataFrame(prices)
    prices_df = prices_df.dropna()
    returns = prices_df.pct_change().dropna()
    correlation = returns.corr()
    
    return {
        "tickers": tickers,
        "correlation": correlation,
        "returns": returns
    }

def plot_correlation(tickers: list = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "BTC-USD", "GLD"]):
    data = calculate_correlation(tickers)
    corr = data["correlation"]
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(18, 7))
    fig.patch.set_facecolor("#0f172a")
    
    # Heatmap корреляции
    cmap = plt.cm.RdYlGn
    im = ax1.imshow(corr.values, cmap=cmap, vmin=-1, vmax=1, aspect="auto")
    
    ax1.set_xticks(range(len(tickers)))
    ax1.set_yticks(range(len(tickers)))
    ax1.set_xticklabels(corr.columns, rotation=45, ha="right", color="white")
    ax1.set_yticklabels(corr.index, color="white")
    
    # Числа в ячейках
    for i in range(len(tickers)):
        for j in range(len(tickers)):
            val = corr.values[i, j]
            color = "black" if abs(val) > 0.5 else "white"
            ax1.text(j, i, f"{val:.2f}", ha="center", va="center", 
                    color=color, fontsize=11, fontweight="bold")
    
    plt.colorbar(im, ax=ax1, label="Корреляция")
    ax1.set_facecolor("#0f172a")
    ax1.set_title("Матрица корреляций", color="white", fontsize=14)
    ax1.tick_params(colors="white")
    
    # График накопленной доходности
    returns = data["returns"]
    cumulative = (1 + returns).cumprod()
    
    colors = ["#38bdf8", "#22c55e", "#a855f7", "#ef4444", "#fbbf24", "#f97316", "#64748b"]
    for i, ticker in enumerate(tickers):
        if ticker in cumulative.columns:
            ax2.plot(cumulative.index, cumulative[ticker], 
                    color=colors[i % len(colors)], linewidth=1.5, label=ticker)
    
    ax2.axhline(y=1, color="white", linestyle="--", alpha=0.3)
    ax2.set_facecolor("#0f172a")
    ax2.set_title("Накопленная доходность", color="white", fontsize=14)
    ax2.set_xlabel("Дата", color="white")
    ax2.set_ylabel("Доходность (1.0 = старт)", color="white")
    ax2.tick_params(colors="white")
    ax2.legend(fontsize=9)
    ax2.grid(True, alpha=0.2)
    
    plt.tight_layout()
    plt.show()
    
    # Выводим в терминал
    print("\n" + "="*55)
    print("  МАТРИЦА КОРРЕЛЯЦИЙ")
    print("="*55)
    print(f"  {'':10}", end="")
    for t in tickers:
        print(f"  {t:>7}", end="")
    print()
    print("-"*55)
    for t1 in tickers:
        print(f"  {t1:<10}", end="")
        for t2 in tickers:
            val = corr.loc[t1, t2] if t1 in corr.index and t2 in corr.columns else 0
            print(f"  {val:>7.2f}", end="")
        print()
    print("="*55)
    print("\n  Интерпретация:")
    print("  > 0.7  = сильная корреляция (плохо для диверсификации)")
    print("  0.3-0.7 = умеренная корреляция")
    print("  < 0.3  = слабая корреляция (хорошо для диверсификации)")

if __name__ == "__main__":
    tickers = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "BTC-USD", "GLD"]
    plot_correlation(tickers)