import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import pandas as pd
from data.loader import load_stock_data

# Исторические кризисы
CRISIS_PERIODS = {
    "COVID-19 (2020)": ("2020-02-19", "2020-03-23"),
    "Крах доткомов (2000-2002)": ("2000-03-10", "2002-10-09"),
    "Финансовый кризис (2008)": ("2007-10-09", "2009-03-09"),
    "Коррекция 2022": ("2022-01-03", "2022-10-12"),
    "Flash Crash (2010)": ("2010-05-06", "2010-05-06"),
}

def stress_test(ticker: str, portfolio_value: float = 10000) -> dict:
    """
    Stress testing — как бы повёл себя портфель в исторических кризисах
    """
    df = load_stock_data(ticker, "max")
    df.index = df.index.tz_localize(None) if df.index.tz else df.index

    results = {}

    for crisis_name, (start, end) in CRISIS_PERIODS.items():
        try:
            start_dt = pd.Timestamp(start)
            end_dt = pd.Timestamp(end)

            # Находим ближайшие даты
            available = df.index[(df.index >= start_dt) & (df.index <= end_dt)]
            if len(available) < 2:
                results[crisis_name] = {"error": "Нет данных за этот период"}
                continue

            price_start = df.loc[available[0], "Close"]
            price_end = df.loc[available[-1], "Close"]

            change_pct = (price_end / price_start - 1) * 100
            loss_usd = portfolio_value * (change_pct / 100)

            # Максимальная просадка за период
            period_prices = df.loc[available, "Close"]
            max_price = period_prices.cummax()
            drawdowns = (period_prices - max_price) / max_price * 100
            max_drawdown = drawdowns.min()

            # Волатильность за период
            returns = period_prices.pct_change().dropna()
            volatility = returns.std() * np.sqrt(252) * 100

            results[crisis_name] = {
                "period": f"{start} — {end}",
                "price_start": round(float(price_start), 2),
                "price_end": round(float(price_end), 2),
                "change_pct": round(float(change_pct), 2),
                "loss_usd": round(float(loss_usd), 2),
                "max_drawdown": round(float(max_drawdown), 2),
                "volatility": round(float(volatility), 2),
                "survived": bool(change_pct > -50)
            }
        except Exception as e:
            results[crisis_name] = {"error": str(e)}

    # Худший кризис
    valid = {k: v for k, v in results.items() if "error" not in v}
    worst = min(valid, key=lambda x: valid[x]["change_pct"]) if valid else None
    best_recovery = max(valid, key=lambda x: valid[x]["change_pct"]) if valid else None

    return {
        "ticker": ticker,
        "portfolio_value": portfolio_value,
        "crises": results,
        "worst_crisis": worst,
        "worst_loss": round(valid[worst]["loss_usd"], 2) if worst else 0,
        "summary": f"Худший кризис для {ticker}: {worst} ({valid[worst]['change_pct']}%)" if worst else ""
    }

if __name__ == "__main__":
    data = stress_test("AAPL", 10000)
    print(f"\n{'='*55}")
    print(f"  STRESS TEST — {data['ticker']}")
    print(f"{'='*55}")
    for crisis, result in data["crises"].items():
        if "error" not in result:
            emoji = "✅" if result["survived"] else "❌"
            print(f"\n  {emoji} {crisis}")
            print(f"     Изменение:    {result['change_pct']}%")
            print(f"     Потери:       ${result['loss_usd']:,.2f}")
            print(f"     Макс просадка: {result['max_drawdown']}%")
    print(f"\n  {data['summary']}")
    print(f"{'='*55}")