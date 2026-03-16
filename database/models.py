from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

DATABASE_URL = "postgresql://nikitasokovyh@localhost:5432/trading_platform"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class BacktestResult(Base):
    """Сохраняем результаты бэктестов"""
    __tablename__ = "backtest_results"
    
    id = Column(Integer, primary_key=True)
    ticker = Column(String, nullable=False)
    strategy = Column(String, nullable=False)
    period = Column(String, nullable=False)
    initial_capital = Column(Float)
    final_capital = Column(Float)
    total_return = Column(Float)
    sharpe_ratio = Column(Float)
    max_drawdown = Column(Float)
    total_trades = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

class PortfolioResult(Base):
    """Сохраняем оптимизации портфелей"""
    __tablename__ = "portfolio_results"
    
    id = Column(Integer, primary_key=True)
    tickers = Column(String)
    weights = Column(JSON)
    expected_return = Column(Float)
    risk = Column(Float)
    sharpe_ratio = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class WatchList(Base):
    """Список отслеживаемых акций"""
    __tablename__ = "watchlist"
    
    id = Column(Integer, primary_key=True)
    ticker = Column(String, nullable=False, unique=True)
    added_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(String, nullable=True)

class Portfolio(Base):
    __tablename__ = "portfolios"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    ticker = Column(String, nullable=False)
    shares = Column(Float, nullable=False)
    avg_price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    
def init_db():
    """Создаём таблицы"""
    Base.metadata.create_all(engine)
    print("БД инициализирована ✅")

if __name__ == "__main__":
    init_db()