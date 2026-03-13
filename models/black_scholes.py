import numpy as np
from scipy.stats import norm
import matplotlib.pyplot as plt
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def black_scholes(S: float, K: float, T: float, 
                  r: float, sigma: float, option_type: str = "call") -> float:
    """
    Модель Блэка-Шоулза
    
    S     - текущая цена акции
    K     - цена исполнения опциона (strike price)
    T     - время до истечения в годах (0.5 = 6 месяцев)
    r     - безрисковая процентная ставка (0.05 = 5%)
    sigma - волатильность акции (0.2 = 20%)
    option_type - "call" (право купить) или "put" (право продать)
    """
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    
    if option_type == "call":
        price = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
    else:
        price = K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
    
    return round(price, 2)

def calculate_greeks(S: float, K: float, T: float, 
                     r: float, sigma: float) -> dict:
    """
    Greeks - чувствительность цены опциона к параметрам
    
    Delta - как меняется цена опциона при изменении цены акции
    Gamma - скорость изменения Delta
    Theta - потеря стоимости опциона со временем
    Vega  - чувствительность к волатильности
    """
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    
    delta = norm.cdf(d1)
    gamma = norm.pdf(d1) / (S * sigma * np.sqrt(T))
    theta = (-(S * norm.pdf(d1) * sigma) / (2 * np.sqrt(T)) - r * K * np.exp(-r * T) * norm.cdf(d2)) / 365
    vega  = S * norm.pdf(d1) * np.sqrt(T) / 100
    
    return {
        "delta": round(delta, 4),
        "gamma": round(gamma, 4),
        "theta": round(theta, 4),
        "vega":  round(vega, 4)
    }

def plot_option_prices(S: float = 150, K: float = 150, 
                       T: float = 0.5, r: float = 0.05):
    """
    Рисует как меняется цена опциона при разной волатильности
    """
    sigmas = np.linspace(0.1, 0.8, 100)
    call_prices = [black_scholes(S, K, T, r, s, "call") for s in sigmas]
    put_prices  = [black_scholes(S, K, T, r, s, "put")  for s in sigmas]
    
    plt.figure(figsize=(12, 6))
    plt.plot(sigmas * 100, call_prices, color="green", linewidth=2, label="Call опцион")
    plt.plot(sigmas * 100, put_prices,  color="red",   linewidth=2, label="Put опцион")
    plt.xlabel("Волатильность (%)")
    plt.ylabel("Цена опциона ($)")
    plt.title(f"Блэк-Шоулз — цена опциона vs волатильность\nS=${S}, K=${K}, T={T} лет, r={r*100}%")
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    # Пример: Apple акция стоит $257
    S = 257      # текущая цена
    K = 260      # хотим купить по $260
    T = 0.5      # через 6 месяцев
    r = 0.05     # ставка 5%
    sigma = 0.25 # волатильность 25%
    
    call_price = black_scholes(S, K, T, r, sigma, "call")
    put_price  = black_scholes(S, K, T, r, sigma, "put")
    greeks     = calculate_greeks(S, K, T, r, sigma)
    
    print("\n" + "="*45)
    print("  МОДЕЛЬ БЛЭКА-ШОУЛЗА — APPLE (AAPL)")
    print("="*45)
    print(f"  Текущая цена акции:      ${S}")
    print(f"  Цена исполнения:         ${K}")
    print(f"  Время до истечения:      {T} лет")
    print(f"  Волатильность:           {sigma*100}%")
    print("-"*45)
    print(f"  Call опцион (право купить):  ${call_price}")
    print(f"  Put опцион (право продать):  ${put_price}")
    print("-"*45)
    print(f"  Delta:  {greeks['delta']}  (при росте акции на $1, опцион растёт на ${greeks['delta']})")
    print(f"  Gamma:  {greeks['gamma']}")
    print(f"  Theta:  {greeks['theta']}  (опцион теряет ${abs(greeks['theta'])} в день)")
    print(f"  Vega:   {greeks['vega']}   (при росте волатильности на 1%, опцион растёт на ${greeks['vega']})")
    print("="*45 + "\n")
    
    plot_option_prices(S, K, T, r)