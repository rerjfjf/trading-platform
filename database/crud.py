from database.models import SessionLocal, BacktestResult, PortfolioResult, WatchList
from datetime import datetime
import json

def save_backtest(ticker, strategy, period, initial_capital, 
                  final_capital, total_return, sharpe_ratio, 
                  max_drawdown, total_trades):
    """Сохраняем результат бэктеста"""
    db = SessionLocal()
    try:
        result = BacktestResult(
            ticker=ticker,
            strategy=strategy,
            period=period,
            initial_capital=initial_capital,
            final_capital=final_capital,
            total_return=total_return,
            sharpe_ratio=sharpe_ratio,
            max_drawdown=max_drawdown,
            total_trades=total_trades
        )
        db.add(result)
        db.commit()
        db.refresh(result)
        return result.id
    finally:
        db.close()

def get_backtest_history(ticker: str = None, limit: int = 20):
    """Получаем историю бэктестов"""
    db = SessionLocal()
    try:
        query = db.query(BacktestResult)
        if ticker:
            query = query.filter(BacktestResult.ticker == ticker)
        results = query.order_by(BacktestResult.created_at.desc()).limit(limit).all()
        return [
            {
                "id": r.id,
                "ticker": r.ticker,
                "strategy": r.strategy,
                "total_return": r.total_return,
                "sharpe_ratio": r.sharpe_ratio,
                "max_drawdown": r.max_drawdown,
                "total_trades": r.total_trades,
                "final_capital": r.final_capital,
                "created_at": r.created_at.isoformat()
            }
            for r in results
        ]
    finally:
        db.close()

def save_portfolio(tickers, weights, expected_return, risk, sharpe_ratio):
    """Сохраняем оптимизацию портфеля"""
    db = SessionLocal()
    try:
        result = PortfolioResult(
            tickers=",".join(tickers),
            weights=weights,
            expected_return=expected_return,
            risk=risk,
            sharpe_ratio=sharpe_ratio
        )
        db.add(result)
        db.commit()
        return result.id
    finally:
        db.close()

def add_to_watchlist(ticker: str, notes: str = None):
    """Добавляем акцию в вотчлист"""
    db = SessionLocal()
    try:
        item = WatchList(ticker=ticker, notes=notes)
        db.add(item)
        db.commit()
        return True
    except:
        db.rollback()
        return False
    finally:
        db.close()

def get_watchlist():
    """Получаем вотчлист"""
    db = SessionLocal()
    try:
        items = db.query(WatchList).order_by(WatchList.added_at.desc()).all()
        return [
            {
                "id": i.id,
                "ticker": i.ticker,
                "notes": i.notes,
                "added_at": i.added_at.isoformat()
            }
            for i in items
        ]
    finally:
        db.close()