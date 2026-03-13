import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from data.loader import load_stock_data

def get_portfolio_data(tickers: list, period: str = "2y") -> pd.DataFrame:
    """
    Загружает данные для нескольких акций
    """
    prices = {}
    for ticker in tickers:
        df = load_stock_data(ticker, period)
        prices[ticker] = df["Close"]
    return pd.DataFrame(prices)

def optimize_portfolio(tickers: list, period: str = "2y", 
                       simulations: int = 5000) -> dict:
    """
    Оптимизация портфеля методом Монте-Карло
    Генерируем 5000 случайных портфелей и находим лучший
    """
    # Загружаем данные
    prices = get_portfolio_data(tickers, period)
    
    # Считаем дневную доходность
    returns = prices.pct_change().dropna()
    
    # Средняя доходность и ковариация
    mean_returns = returns.mean()
    cov_matrix = returns.cov()
    
    # Массивы для результатов
    results = np.zeros((3, simulations))
    weights_array = []
    
    print(f"Симулируем {simulations} портфелей...")
    
    for i in range(simulations):
        # Случайные веса
        weights = np.random.random(len(tickers))
        weights = weights / weights.sum()  # нормализуем чтобы сумма = 1
        weights_array.append(weights)
        
        # Годовая доходность
        portfolio_return = np.sum(mean_returns * weights) * 252
        
        # Годовой риск
        portfolio_std = np.sqrt(
            np.dot(weights.T, np.dot(cov_matrix * 252, weights))
        )
        
        # Sharpe Ratio
        sharpe = portfolio_return / portfolio_std
        
        results[0, i] = portfolio_return
        results[1, i] = portfolio_std
        results[2, i] = sharpe
    
    # Находим лучший портфель по Sharpe Ratio
    best_idx = results[2].argmax()
    best_weights = weights_array[best_idx]
    
    return {
        "results": results,
        "best_weights": best_weights,
        "best_return": round(results[0, best_idx] * 100, 2),
        "best_risk": round(results[1, best_idx] * 100, 2),
        "best_sharpe": round(results[2, best_idx], 2),
        "tickers": tickers
    }

def plot_portfolio(data: dict):
    """
    Рисует границу эффективности портфелей
    """
    results = data["results"]
    tickers = data["tickers"]
    best_weights = data["best_weights"]
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7))
    
    # График эффективной границы
    scatter = ax1.scatter(
        results[1] * 100,  # риск
        results[0] * 100,  # доходность
        c=results[2],      # цвет = Sharpe Ratio
        cmap="viridis",
        alpha=0.5,
        s=5
    )
    
    # Отмечаем лучший портфель
    ax1.scatter(
        data["best_risk"],
        data["best_return"],
        marker="*",
        color="red",
        s=300,
        zorder=5,
        label=f"Лучший портфель (Sharpe {data['best_sharpe']})"
    )
    
    plt.colorbar(scatter, ax=ax1, label="Sharpe Ratio")
    ax1.set_xlabel("Риск (%)")
    ax1.set_ylabel("Доходность (%)")
    ax1.set_title("Эффективная граница портфелей")
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # График распределения весов
    colors = ["#2196F3", "#4CAF50", "#FF9800", "#E91E63", "#9C27B0"]
    ax2.pie(
        best_weights,
        labels=tickers,
        autopct="%1.1f%%",
        colors=colors[:len(tickers)],
        startangle=90
    )
    ax2.set_title("Оптимальное распределение портфеля")
    
    plt.tight_layout()
    plt.show()
    
    # Выводим результаты
    print("\n" + "="*45)
    print("  ОПТИМАЛЬНЫЙ ПОРТФЕЛЬ (Марковиц)")
    print("="*45)
    for ticker, weight in zip(tickers, best_weights):
        print(f"  {ticker:<8} {weight*100:>6.1f}%")
    print("-"*45)
    print(f"  Ожидаемая доходность:  {data['best_return']}% в год")
    print(f"  Риск:                  {data['best_risk']}%")
    print(f"  Sharpe Ratio:          {data['best_sharpe']}")
    print("="*45 + "\n")

if __name__ == "__main__":
    # Портфель из 5 акций
    tickers = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN"]
    
    data = optimize_portfolio(tickers, period="2y", simulations=5000)
    plot_portfolio(data)