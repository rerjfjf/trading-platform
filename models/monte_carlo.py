import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from data.loader import load_stock_data

def monte_carlo_simulation(ticker: str, days: int = 126, 
                           simulations: int = 1000) -> dict:
    """
    Симуляция будущих цен методом Монте-Карло
    days       - сколько дней вперёд симулируем (126 = 6 месяцев)
    simulations - количество симуляций
    """
    df = load_stock_data(ticker, "2y")
    
    # Считаем дневную доходность и волатильность
    returns = df["Close"].pct_change().dropna()
    mu = returns.mean()          # средняя дневная доходность
    sigma = returns.std()        # дневная волатильность
    last_price = df["Close"].iloc[-1]
    
    print(f"Текущая цена {ticker}: ${last_price:.2f}")
    print(f"Дневная доходность: {mu*100:.3f}%")
    print(f"Дневная волатильность: {sigma*100:.3f}%")
    print(f"Симулируем {simulations} сценариев на {days} дней...")
    
    # Матрица симуляций
    simulations_matrix = np.zeros((days, simulations))
    
    for i in range(simulations):
        prices = [last_price]
        for d in range(days - 1):
            # Случайное движение цены
            shock = np.random.normal(mu, sigma)
            price = prices[-1] * (1 + shock)
            prices.append(price)
        simulations_matrix[:, i] = prices
    
    # Финальные цены через days дней
    final_prices = simulations_matrix[-1, :]
    
    return {
        "ticker": ticker,
        "last_price": last_price,
        "simulations": simulations_matrix,
        "final_prices": final_prices,
        "days": days,
        "percentile_5":  round(np.percentile(final_prices, 5), 2),
        "percentile_25": round(np.percentile(final_prices, 25), 2),
        "percentile_50": round(np.percentile(final_prices, 50), 2),
        "percentile_75": round(np.percentile(final_prices, 75), 2),
        "percentile_95": round(np.percentile(final_prices, 95), 2),
        "prob_profit":   round((final_prices > last_price).mean() * 100, 1),
    }

def plot_monte_carlo(data: dict):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7))
    
    ticker = data["ticker"]
    simulations = data["simulations"]
    final_prices = data["final_prices"]
    days = data["days"]
    last_price = data["last_price"]
    
    # График симуляций
    for i in range(min(200, simulations.shape[1])):
        color = "green" if simulations[-1, i] > last_price else "red"
        ax1.plot(simulations[:, i], alpha=0.05, linewidth=0.5, color=color)
    
    # Перцентили
    ax1.plot(np.percentile(simulations, 5, axis=1),
             color="red", linewidth=2, linestyle="--", label="5% (худший сценарий)")
    ax1.plot(np.percentile(simulations, 50, axis=1),
             color="white", linewidth=2, label="50% (медиана)")
    ax1.plot(np.percentile(simulations, 95, axis=1),
             color="green", linewidth=2, linestyle="--", label="95% (лучший сценарий)")
    
    ax1.axhline(y=last_price, color="yellow", 
                linestyle="-", linewidth=1.5, alpha=0.7, label=f"Текущая цена ${last_price:.2f}")
    ax1.set_facecolor("#0f172a")
    ax1.set_title(f"{ticker} — Monte Carlo ({days} дней, 1000 симуляций)", color="white")
    ax1.set_xlabel("Дни", color="white")
    ax1.set_ylabel("Цена ($)", color="white")
    ax1.tick_params(colors="white")
    ax1.legend(fontsize=9)
    ax1.grid(True, alpha=0.2)
    
    # Гистограмма финальных цен
    ax2.hist(final_prices, bins=50, color="#38bdf8", alpha=0.7, edgecolor="none")
    ax2.axvline(x=last_price, color="yellow", 
                linewidth=2, label=f"Текущая ${last_price:.2f}")
    ax2.axvline(x=data["percentile_5"], color="red",
                linewidth=2, linestyle="--", label=f"5% — ${data['percentile_5']}")
    ax2.axvline(x=data["percentile_95"], color="green",
                linewidth=2, linestyle="--", label=f"95% — ${data['percentile_95']}")
    ax2.set_facecolor("#0f172a")
    ax2.set_title(f"Распределение цен через {days} дней", color="white")
    ax2.set_xlabel("Цена ($)", color="white")
    ax2.set_ylabel("Количество симуляций", color="white")
    ax2.tick_params(colors="white")
    ax2.legend(fontsize=9)
    ax2.grid(True, alpha=0.2)
    
    fig.patch.set_facecolor("#0f172a")
    plt.tight_layout()
    plt.show()
    
    # Результаты
    print("\n" + "="*45)
    print(f"  MONTE CARLO — {ticker} (через {days} дней)")
    print("="*45)
    print(f"  Текущая цена:        ${last_price:.2f}")
    print(f"  Худший сценарий 5%:  ${data['percentile_5']}")
    print(f"  Нижняя граница 25%:  ${data['percentile_25']}")
    print(f"  Медиана 50%:         ${data['percentile_50']}")
    print(f"  Верхняя граница 75%: ${data['percentile_75']}")
    print(f"  Лучший сценарий 95%: ${data['percentile_95']}")
    print("-"*45)
    print(f"  Вероятность прибыли: {data['prob_profit']}%")
    print("="*45 + "\n")

if __name__ == "__main__":
    data = monte_carlo_simulation("AAPL", days=126, simulations=1000)
    plot_monte_carlo(data)