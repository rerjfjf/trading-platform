import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.loader import load_stock_data
from strategies.ma_crossover import ma_crossover_strategy
from strategies.rsi import rsi_strategy
from strategies.macd import macd_strategy
from strategies.bollinger_bands import bollinger_bands_strategy
from backtest.engine import BacktestEngine

def compare_strategies(ticker: str = "AAPL", period: str = "2y"):
    df = load_stock_data(ticker, period)
    engine = BacktestEngine(initial_capital=10000)

    results = {}
    results["MA Cross"]  = engine.run(ma_crossover_strategy(df.copy()))
    results["RSI"]       = engine.run(rsi_strategy(df.copy()))
    results["MACD"]      = engine.run(macd_strategy(df.copy()))
    results["Bollinger"] = engine.run(bollinger_bands_strategy(df.copy()))

    print("\n" + "="*65)
    print(f"  СРАВНЕНИЕ СТРАТЕГИЙ — {ticker} ({period})")
    print("="*65)
    print(f"  {'Метрика':<22} {'MA Cross':>10} {'RSI':>10} {'MACD':>10} {'Bollinger':>10}")
    print("-"*65)
    print(f"  {'Доходность (%)':.<22} {results['MA Cross']['total_return']:>10} {results['RSI']['total_return']:>10} {results['MACD']['total_return']:>10} {results['Bollinger']['total_return']:>10}")
    print(f"  {'Капитал ($)':.<22} {results['MA Cross']['final_capital']:>10} {results['RSI']['final_capital']:>10} {results['MACD']['final_capital']:>10} {results['Bollinger']['final_capital']:>10}")
    print(f"  {'Sharpe Ratio':.<22} {results['MA Cross']['sharpe_ratio']:>10} {results['RSI']['sharpe_ratio']:>10} {results['MACD']['sharpe_ratio']:>10} {results['Bollinger']['sharpe_ratio']:>10}")
    print(f"  {'Макс. просадка (%)':.<22} {results['MA Cross']['max_drawdown']:>10} {results['RSI']['max_drawdown']:>10} {results['MACD']['max_drawdown']:>10} {results['Bollinger']['max_drawdown']:>10}")
    print(f"  {'Сделок':.<22} {results['MA Cross']['total_trades']:>10} {results['RSI']['total_trades']:>10} {results['MACD']['total_trades']:>10} {results['Bollinger']['total_trades']:>10}")
    print("="*65)

if __name__ == "__main__":
    compare_strategies("AAPL", "2y")