import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.loader import load_stock_data
from strategies.ma_crossover import ma_crossover_strategy
from strategies.rsi import rsi_strategy
from strategies.macd import macd_strategy
from backtest.engine import BacktestEngine

def compare_strategies(ticker: str = "AAPL", period: str = "2y"):
    df = load_stock_data(ticker, period)
    engine = BacktestEngine(initial_capital=10000)

    df_ma   = ma_crossover_strategy(df.copy())
    df_rsi  = rsi_strategy(df.copy())
    df_macd = macd_strategy(df.copy())

    results_ma   = engine.run(df_ma)
    results_rsi  = engine.run(df_rsi)
    results_macd = engine.run(df_macd)

    print("\n" + "="*60)
    print(f"  СРАВНЕНИЕ СТРАТЕГИЙ — {ticker} ({period})")
    print("="*60)
    print(f"  {'Метрика':<25} {'MA Cross':>10} {'RSI':>10} {'MACD':>10}")
    print("-"*60)
    print(f"  {'Доходность (%)':.<25} {results_ma['total_return']:>10} {results_rsi['total_return']:>10} {results_macd['total_return']:>10}")
    print(f"  {'Финальный капитал ($)':.<25} {results_ma['final_capital']:>10} {results_rsi['final_capital']:>10} {results_macd['final_capital']:>10}")
    print(f"  {'Sharpe Ratio':.<25} {results_ma['sharpe_ratio']:>10} {results_rsi['sharpe_ratio']:>10} {results_macd['sharpe_ratio']:>10}")
    print(f"  {'Макс. просадка (%)':.<25} {results_ma['max_drawdown']:>10} {results_rsi['max_drawdown']:>10} {results_macd['max_drawdown']:>10}")
    print(f"  {'Кол-во сделок':.<25} {results_ma['total_trades']:>10} {results_rsi['total_trades']:>10} {results_macd['total_trades']:>10}")
    print("="*60)

if __name__ == "__main__":
    compare_strategies("AAPL", "2y")