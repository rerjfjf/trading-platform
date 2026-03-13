import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from data.loader import load_stock_data
from strategies.ma_crossover import ma_crossover_strategy

class BacktestEngine:
    def __init__(self, initial_capital: float = 10000.0):
        """
        initial_capital - начальный капитал в долларах
        """
        self.initial_capital = initial_capital

    def run(self, df: pd.DataFrame) -> dict:
        """
        Запускает бэктест на данных с сигналами
        Возвращает словарь с результатами
        """
        df = df.copy()
        
        capital = self.initial_capital
        position = 0        # сколько акций держим
        trades = []         # история сделок
        portfolio = []      # история стоимости портфеля

        for i, (date, row) in enumerate(df.iterrows()):
            # Пропускаем пока нет сигналов
            if pd.isna(row["Position"]):
                portfolio.append({"date": date, "value": capital})
                continue

            # Сигнал КУПИТЬ
            if row["Position"] == 2 and position == 0:
                position = capital / row["Close"]  # покупаем на все деньги
                capital = 0
                trades.append({
                    "date": date,
                    "type": "BUY",
                    "price": row["Close"],
                    "shares": position
                })

            # Сигнал ПРОДАТЬ
            elif row["Position"] == -2 and position > 0:
                capital = position * row["Close"]  # продаём все акции
                trades.append({
                    "date": date,
                    "type": "SELL",
                    "price": row["Close"],
                    "shares": position,
                    "profit": capital - self.initial_capital
                })
                position = 0

            # Считаем текущую стоимость портфеля
            current_value = capital + (position * row["Close"])
            portfolio.append({"date": date, "value": current_value})

        # Если остались в позиции — закрываем по последней цене
        if position > 0:
            capital = position * df["Close"].iloc[-1]

        # Считаем метрики
        portfolio_df = pd.DataFrame(portfolio).set_index("date")
        returns = portfolio_df["value"].pct_change().dropna()

        total_return = (capital - self.initial_capital) / self.initial_capital * 100
        sharpe = returns.mean() / returns.std() * np.sqrt(252) if returns.std() > 0 else 0
        
        rolling_max = portfolio_df["value"].cummax()
        drawdown = (portfolio_df["value"] - rolling_max) / rolling_max * 100
        max_drawdown = drawdown.min()

        return {
            "initial_capital": self.initial_capital,
            "final_capital": round(capital, 2),
            "total_return": round(total_return, 2),
            "sharpe_ratio": round(sharpe, 2),
            "max_drawdown": round(max_drawdown, 2),
            "total_trades": len(trades),
            "trades": trades,
            "portfolio": portfolio_df
        }

    def plot_results(self, results: dict, ticker: str):
        """
        Рисует график результатов бэктеста
        """
        portfolio = results["portfolio"]

        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10), sharex=True)

        # График портфеля
        ax1.plot(portfolio.index, portfolio["value"], 
                 color="blue", linewidth=1.5, label="Стоимость портфеля")
        ax1.axhline(y=self.initial_capital, color="gray", 
                    linestyle="--", alpha=0.7, label="Начальный капитал")
        ax1.fill_between(portfolio.index, portfolio["value"], self.initial_capital,
                         where=portfolio["value"] >= self.initial_capital,
                         color="green", alpha=0.2, label="Прибыль")
        ax1.fill_between(portfolio.index, portfolio["value"], self.initial_capital,
                         where=portfolio["value"] < self.initial_capital,
                         color="red", alpha=0.2, label="Убыток")
        ax1.set_ylabel("Стоимость ($)")
        ax1.set_title(f"{ticker} — результаты бэктеста")
        ax1.legend()
        ax1.grid(True, alpha=0.3)

        # Просадка
        rolling_max = portfolio["value"].cummax()
        drawdown = (portfolio["value"] - rolling_max) / rolling_max * 100
        ax2.fill_between(portfolio.index, drawdown, 0, color="red", alpha=0.4)
        ax2.set_ylabel("Просадка (%)")
        ax2.set_xlabel("Дата")
        ax2.set_title("Просадка портфеля")
        ax2.grid(True, alpha=0.3)

        plt.tight_layout()
        plt.show()

        # Выводим результаты в терминал
        print("\n" + "="*40)
        print(f"  РЕЗУЛЬТАТЫ БЭКТЕСТА — {ticker}")
        print("="*40)
        print(f"  Начальный капитал:    ${results['initial_capital']:,.2f}")
        print(f"  Финальный капитал:    ${results['final_capital']:,.2f}")
        print(f"  Доходность:           {results['total_return']}%")
        print(f"  Sharpe Ratio:         {results['sharpe_ratio']}")
        print(f"  Макс. просадка:       {results['max_drawdown']}%")
        print(f"  Количество сделок:    {results['total_trades']}")
        print("="*40 + "\n")


if __name__ == "__main__":
    ticker = "AAPL"
    df = load_stock_data(ticker, "2y")
    df = ma_crossover_strategy(df)
    
    engine = BacktestEngine(initial_capital=10000)
    results = engine.run(df)
    engine.plot_results(results, ticker)