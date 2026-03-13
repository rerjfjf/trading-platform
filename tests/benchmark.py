import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import time
import rust_engine
from data.loader import load_stock_data
from strategies.rsi import rsi_strategy
from backtest.engine import BacktestEngine

# Загружаем данные
df = load_stock_data("AAPL", "5y")
df = rsi_strategy(df)

closes = df["Close"].tolist()
signals = df["Position"].fillna(0).astype(int).tolist()

# --- Python бэктест ---
start = time.perf_counter()
for _ in range(1000):
    engine = BacktestEngine(10000)
    result = engine.run(df)
python_time = time.perf_counter() - start

# --- Rust бэктест ---
start = time.perf_counter()
for _ in range(1000):
    result_rust = rust_engine.run_backtest(10000.0, closes, signals)
rust_time = time.perf_counter() - start

print("\n" + "="*45)
print("  BENCHMARK — Python vs Rust (1000 запусков)")
print("="*45)
print(f"  Python:  {python_time:.3f} сек")
print(f"  Rust:    {rust_time:.3f} сек")
print(f"  Rust быстрее в: {python_time/rust_time:.1f}x")
print("="*45)