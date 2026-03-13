import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt

def load_stock_data(ticker: str, period: str = "1y") -> pd.DataFrame:
    """
    Загружает исторические данные акции
    ticker - название акции (например AAPL, TSLA, GOOGL)
    period - период: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y
    """
    print(f"Загружаем данные для {ticker}...")
    stock = yf.Ticker(ticker)
    df = stock.history(period=period)
    print(f"Загружено {len(df)} записей")
    return df

def plot_stock(ticker: str, period: str = "1y"):
    """
    Рисует график цены акции
    """
    df = load_stock_data(ticker, period)
    
    plt.figure(figsize=(12, 6))
    plt.plot(df.index, df["Close"], color="blue", linewidth=1.5)
    plt.title(f"{ticker} — цена закрытия")
    plt.xlabel("Дата")
    plt.ylabel("Цена ($)")
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.show()

# Запускаем
if __name__ == "__main__":
    plot_stock("AAPL", "1y")