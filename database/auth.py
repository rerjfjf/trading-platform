from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from database.models import Base, engine, SessionLocal
import enum

# Секретный ключ — в продакшне хранить в переменных окружения
SECRET_KEY = "trading_platform_secret_key_2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 часа

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Планы пользователей
class UserPlan(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    PREMIUM = "premium"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    plan = Column(String, default="free")
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    requests_today = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

# Лимиты по планам
PLAN_LIMITS = {
    "free": {
        "requests_per_day": 10,
        "strategies": ["rsi"],
        "features": ["backtest", "stock"],
    },
    "pro": {
        "requests_per_day": 100,
        "strategies": ["rsi", "ma", "macd", "bollinger"],
        "features": ["backtest", "stock", "monte_carlo", "lstm", "portfolio"],
    },
    "premium": {
        "requests_per_day": 999999,
        "strategies": ["rsi", "ma", "macd", "bollinger"],
        "features": ["all"],
    }
}

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def create_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

def get_user(username: str) -> Optional[User]:
    db = SessionLocal()
    try:
        return db.query(User).filter(User.username == username).first()
    finally:
        db.close()

def create_user(username: str, email: str, password: str, plan: str = "free") -> User:
    db = SessionLocal()
    try:
        user = User(
            username=username,
            email=email,
            hashed_password=hash_password(password),
            plan=plan
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()

def init_auth():
    Base.metadata.create_all(engine)
    print("Auth таблицы созданы ✅")
    
    # Создаём админа если нет
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@trading.com",
                hashed_password=hash_password("admin123"),
                plan="premium",
                is_admin=True
            )
            db.add(admin)
            db.commit()
            print("Админ создан: admin / admin123 ✅")
    finally:
        db.close()

if __name__ == "__main__":
    init_auth()