import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.preprocessing import MinMaxScaler
from data.loader import load_stock_data
import matplotlib.pyplot as plt

# --- Модель LSTM ---
class LSTMModel(nn.Module):
    def __init__(self, input_size=1, hidden_size=64, num_layers=2, output_size=1):
        super(LSTMModel, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        out, _ = self.lstm(x, (h0, c0))
        out = self.fc(out[:, -1, :])
        return out

def prepare_data(prices: np.array, lookback: int = 60):
    """
    Подготавливаем данные для LSTM
    lookback - сколько дней смотрим назад для предсказания
    """
    X, y = [], []
    for i in range(lookback, len(prices)):
        X.append(prices[i-lookback:i])
        y.append(prices[i])
    return np.array(X), np.array(y)

def train_and_predict(ticker: str = "AAPL", period: str = "5y", 
                      lookback: int = 60, epochs: int = 50,
                      predict_days: int = 30) -> dict:
    """
    Обучаем LSTM и предсказываем будущие цены
    """
    print(f"Загружаем данные для {ticker}...")
    df = load_stock_data(ticker, period)
    prices = df["Close"].values.reshape(-1, 1)
    
    # Нормализуем данные от 0 до 1
    scaler = MinMaxScaler()
    prices_scaled = scaler.fit_transform(prices)
    
    # Делим на train/test (80/20)
    split = int(len(prices_scaled) * 0.8)
    train_data = prices_scaled[:split]
    test_data = prices_scaled[split:]
    
    X_train, y_train = prepare_data(train_data, lookback)
    X_test, y_test = prepare_data(test_data, lookback)
    
    # Конвертируем в тензоры PyTorch
    X_train = torch.FloatTensor(X_train)
    y_train = torch.FloatTensor(y_train)
    X_test = torch.FloatTensor(X_test)
    y_test = torch.FloatTensor(y_test)
    
    # Создаём модель
    model = LSTMModel()
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    
    # Обучаем
    print(f"Обучаем LSTM на {epochs} эпохах...")
    model.train()
    for epoch in range(epochs):
        optimizer.zero_grad()
        output = model(X_train)
        loss = criterion(output, y_train)
        loss.backward()
        optimizer.step()
        if (epoch + 1) % 10 == 0:
            print(f"Эпоха {epoch+1}/{epochs} — Loss: {loss.item():.6f}")
    
    # Предсказываем на тестовых данных
    model.eval()
    with torch.no_grad():
        test_pred = model(X_test).numpy()
    
    # Предсказываем будущее
    last_sequence = prices_scaled[-lookback:]
    future_prices = []
    
    for _ in range(predict_days):
        seq = torch.FloatTensor(last_sequence).unsqueeze(0)
        with torch.no_grad():
            next_price = model(seq).numpy()[0][0]
        future_prices.append(next_price)
        last_sequence = np.append(last_sequence[1:], [[next_price]], axis=0)
    
    # Денормализуем
    test_pred_actual = scaler.inverse_transform(test_pred)
    y_test_actual = scaler.inverse_transform(y_test.numpy())
    future_actual = scaler.inverse_transform(np.array(future_prices).reshape(-1, 1))
    
    return {
        "ticker": ticker,
        "test_actual": y_test_actual.flatten(),
        "test_predicted": test_pred_actual.flatten(),
        "future_prices": future_actual.flatten(),
        "last_price": float(prices[-1][0]),
        "predicted_price_30d": float(future_actual[-1][0]),
        "change_30d": round((float(future_actual[-1][0]) - float(prices[-1][0])) / float(prices[-1][0]) * 100, 2)
    }

def plot_lstm(data: dict):
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10))
    
    # График предсказания на тестовых данных
    ax1.plot(data["test_actual"], color="blue", linewidth=1.5, label="Реальная цена")
    ax1.plot(data["test_predicted"], color="red", linewidth=1.5, label="Предсказание LSTM", alpha=0.8)
    ax1.set_title(f"{data['ticker']} — LSTM: реальная vs предсказанная цена")
    ax1.set_ylabel("Цена ($)")
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # График будущих цен
    days = list(range(1, len(data["future_prices"]) + 1))
    color = "green" if data["change_30d"] >= 0 else "red"
    ax2.plot(days, data["future_prices"], color=color, linewidth=2, label=f"Прогноз на 30 дней")
    ax2.axhline(y=data["last_price"], color="gray", linestyle="--", alpha=0.7, label=f"Текущая цена ${data['last_price']:.2f}")
    ax2.fill_between(days, data["future_prices"], data["last_price"],
                     where=[p > data["last_price"] for p in data["future_prices"]],
                     color="green", alpha=0.2)
    ax2.fill_between(days, data["future_prices"], data["last_price"],
                     where=[p <= data["last_price"] for p in data["future_prices"]],
                     color="red", alpha=0.2)
    ax2.set_title(f"Прогноз на 30 дней — изменение: {data['change_30d']}%")
    ax2.set_xlabel("Дни")
    ax2.set_ylabel("Цена ($)")
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.show()
    
    print("\n" + "="*45)
    print(f"  LSTM ПРОГНОЗ — {data['ticker']}")
    print("="*45)
    print(f"  Текущая цена:        ${data['last_price']:.2f}")
    print(f"  Прогноз через 30д:   ${data['predicted_price_30d']:.2f}")
    print(f"  Ожидаемое изменение: {data['change_30d']}%")
    print("="*45)

if __name__ == "__main__":
    data = train_and_predict("AAPL", period="5y", epochs=50)
    plot_lstm(data)