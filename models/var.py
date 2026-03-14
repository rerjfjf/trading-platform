import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from data.loader import load_stock_data

def calculate_var(ticker: str, portfolio_value: float = 10000,
                  confidence: float = 0.95, period: str = "2y") -> dict:
    """
    Value at Risk (VaR) — сколько максимально можно потерять
    за один день с заданной вероятностью
    
    confidence = 0.95 означает:
    "С вероятностью 95% мы не потеряем больше чем X за один день"
    
    Используется во всех банках мира для оценки риска
    """
    df = load_stock_data(ticker, period)
    returns = df["Close"].pct_change().dropna()
    
    # Исторический VaR
    var_historical = np.percentile(returns, (1 - confidence) * 100)
    
    # Параметрический VaR (предполагаем нормальное распределение)
    mu = returns.mean()
    sigma = returns.std()
    from scipy.stats import norm
    var_parametric = norm.ppf(1 - confidence, mu, sigma)
    
    # CVaR (Conditional VaR) — среднее потерь за порогом VaR
    cvar = returns[returns <= var_historical].mean()
    
    # В долларах
    var_historical_usd = abs(var_historical) * portfolio_value
    var_parametric_usd = abs(var_parametric) * portfolio_value
    cvar_usd = abs(cvar) * portfolio_value
    
    # Годовой VaR
    var_annual = abs(var_historical) * np.sqrt(252) * portfolio_value
    
    return {
        "ticker": ticker,
        "portfolio_value": portfolio_value,
        "confidence": confidence * 100,
        "var_historical": round(var_historical * 100, 3),
        "var_parametric": round(var_parametric * 100, 3),
        "cvar": round(cvar * 100, 3),
        "var_historical_usd": round(var_historical_usd, 2),
        "var_parametric_usd": round(var_parametric_usd, 2),
        "cvar_usd": round(cvar_usd, 2),
        "var_annual_usd": round(var_annual, 2),
        "returns": returns
    }

def plot_var(ticker: str = "AAPL", portfolio_value: float = 10000):
    data = calculate_var(ticker, portfolio_value)
    returns = data["returns"]
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7))
    fig.patch.set_facecolor("#0f172a")
    
    # Гистограмма доходностей
    n, bins, patches = ax1.hist(returns * 100, bins=50, 
                                 color="#38bdf8", alpha=0.7, edgecolor="none")
    
    # Окрашиваем потери красным
    for patch, left in zip(patches, bins[:-1]):
        if left < data["var_historical"]:
            patch.set_facecolor("#ef4444")
    
    ax1.axvline(x=data["var_historical"], color="#ef4444", 
                linewidth=2, label=f"VaR 95%: {data['var_historical']}%")
    ax1.axvline(x=data["cvar"], color="#f97316",
                linewidth=2, linestyle="--", label=f"CVaR: {data['cvar']}%")
    ax1.axvline(x=0, color="white", linewidth=1, alpha=0.5)
    
    ax1.set_facecolor("#0f172a")
    ax1.set_title(f"{ticker} — Распределение дневных доходностей", color="white")
    ax1.set_xlabel("Доходность (%)", color="white")
    ax1.set_ylabel("Количество дней", color="white")
    ax1.tick_params(colors="white")
    ax1.legend(fontsize=10)
    ax1.grid(True, alpha=0.2)
    
    # График потерь во времени
    rolling_var = returns.rolling(window=30).quantile(0.05)
    ax2.fill_between(returns.index, returns * 100, 0,
                     where=returns < 0, color="#ef4444", alpha=0.4, label="Потери")
    ax2.fill_between(returns.index, returns * 100, 0,
                     where=returns >= 0, color="#22c55e", alpha=0.4, label="Прибыль")
    ax2.plot(rolling_var.index, rolling_var * 100, 
             color="orange", linewidth=1.5, label="VaR 30д скользящий")
    ax2.set_facecolor("#0f172a")
    ax2.set_title(f"Дневные доходности и скользящий VaR", color="white")
    ax2.set_xlabel("Дата", color="white")
    ax2.set_ylabel("Доходность (%)", color="white")
    ax2.tick_params(colors="white")
    ax2.legend(fontsize=10)
    ax2.grid(True, alpha=0.2)
    
    plt.tight_layout()
    plt.show()
    
    print("\n" + "="*50)
    print(f"  VALUE AT RISK — {ticker}")
    print("="*50)
    print(f"  Портфель:              ${portfolio_value:,.0f}")
    print(f"  Уверенность:           {data['confidence']}%")
    print("-"*50)
    print(f"  VaR (исторический):    {data['var_historical']}% = -${data['var_historical_usd']}")
    print(f"  VaR (параметрический): {data['var_parametric']}% = -${data['var_parametric_usd']}")
    print(f"  CVaR (худший случай):  {data['cvar']}% = -${data['cvar_usd']}")
    print(f"  Годовой VaR:           -${data['var_annual_usd']:,.0f}")
    print("-"*50)
    print(f"  Это значит: с вероятностью {data['confidence']}% ты")
    print(f"  не потеряешь больше ${data['var_historical_usd']} за один день")
    print("="*50)

if __name__ == "__main__":
    plot_var("AAPL", portfolio_value=10000)