use pyo3::prelude::*;

/// Структура одной свечи (один торговый день)
#[derive(Debug)]
struct Candle {
    close: f64,
    signal: i32,
}

/// Основной движок бэктестинга на Rust
/// initial_capital - начальный капитал
/// closes - список цен закрытия
/// signals - список сигналов (2 = купить, -2 = продать)
#[pyfunction]
fn run_backtest(
    initial_capital: f64,
    closes: Vec<f64>,
    signals: Vec<i32>,
) -> PyResult<(f64, f64, f64, i32)> {
    
    let mut capital = initial_capital;
    let mut position: f64 = 0.0;
    let mut trades: i32 = 0;
    let mut max_value = initial_capital;
    let mut max_drawdown: f64 = 0.0;

    for (i, (&close, &signal)) in closes.iter().zip(signals.iter()).enumerate() {
        // Купить
        if signal == 2 && position == 0.0 {
            position = capital / close;
            capital = 0.0;
            trades += 1;
        }
        // Продать
        else if signal == -2 && position > 0.0 {
            capital = position * close;
            position = 0.0;
            trades += 1;
        }

        // Считаем просадку
        let current_value = capital + position * close;
        if current_value > max_value {
            max_value = current_value;
        }
        let drawdown = (current_value - max_value) / max_value * 100.0;
        if drawdown < max_drawdown {
            max_drawdown = drawdown;
        }
    }

    // Закрываем позицию по последней цене
    if position > 0.0 {
        capital = position * closes[closes.len() - 1];
    }

    let total_return = (capital - initial_capital) / initial_capital * 100.0;

    Ok((capital, total_return, max_drawdown, trades))
}

/// Быстрый расчёт RSI на Rust
#[pyfunction]
fn calculate_rsi(closes: Vec<f64>, period: usize) -> PyResult<Vec<f64>> {
    let n = closes.len();
    let mut rsi = vec![f64::NAN; n];

    if n < period + 1 {
        return Ok(rsi);
    }

    let mut gains = vec![0.0f64; n];
    let mut losses = vec![0.0f64; n];

    for i in 1..n {
        let diff = closes[i] - closes[i - 1];
        if diff > 0.0 {
            gains[i] = diff;
        } else {
            losses[i] = -diff;
        }
    }

    // Первое среднее
    let mut avg_gain: f64 = gains[1..=period].iter().sum::<f64>() / period as f64;
    let mut avg_loss: f64 = losses[1..=period].iter().sum::<f64>() / period as f64;

    for i in period..n {
        if i > period {
            avg_gain = (avg_gain * (period - 1) as f64 + gains[i]) / period as f64;
            avg_loss = (avg_loss * (period - 1) as f64 + losses[i]) / period as f64;
        }
        if avg_loss == 0.0 {
            rsi[i] = 100.0;
        } else {
            let rs = avg_gain / avg_loss;
            rsi[i] = 100.0 - (100.0 / (1.0 + rs));
        }
    }

    Ok(rsi)
}

/// Модуль Python
#[pymodule]
fn rust_engine(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(run_backtest, m)?)?;
    m.add_function(wrap_pyfunction!(calculate_rsi, m)?)?;
    Ok(())
}