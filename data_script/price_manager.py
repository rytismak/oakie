import os
import json
import logging
import pandas as pd
from datetime import datetime
from typing import Dict, List, Optional

class PriceDataManager:
    """Manages stock price data fetching and processing."""
    def __init__(self, details_dir: str, error_logger, price_update_days: int = 30):
        self.details_dir = details_dir
        self.error_logger = error_logger
        self.price_update_days = price_update_days
        os.makedirs(details_dir, exist_ok=True)
    def get_most_recent_price_date(self, ticker: str) -> Optional[datetime.date]:
        ticker_file_path = os.path.join(self.details_dir, f'{ticker}.json')
        if not os.path.exists(ticker_file_path):
            return None
        try:
            with open(ticker_file_path, 'r') as f:
                data = json.load(f)
            prices = data.get('HistoricalPrices', [])
            if not prices:
                return None
            valid_prices = []
            for p in prices:
                if 'Date' in p and 'Close' in p:
                    try:
                        date_str = str(p['Date']).split('T')[0]
                        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
                        valid_prices.append(date_obj)
                    except (ValueError, TypeError):
                        continue
            return max(valid_prices) if valid_prices else None
        except Exception as e:
            self.error_logger.warning(f"Could not read historical prices for {ticker}: {e}")
            return None
    def process_price_dataframe(self, df: pd.DataFrame, ticker: str) -> List[Dict]:
        if df is None or df.empty:
            return []
        try:
            if 'Date' not in df.columns:
                df = df.reset_index()
            price_col = self._find_price_column(df)
            if not price_col or 'Date' not in df.columns:
                self.error_logger.warning(f"Could not find valid price/date columns for {ticker}")
                return []
            price_records = []
            for _, row in df.iterrows():
                try:
                    date_val = row['Date']
                    price_val = row[price_col]
                    if pd.isna(price_val) or price_val <= 0:
                        continue
                    if isinstance(date_val, pd.Timestamp):
                        date_str = date_val.strftime('%Y-%m-%d')
                    else:
                        try:
                            parsed_date = pd.to_datetime(date_val)
                            date_str = parsed_date.strftime('%Y-%m-%d')
                        except:
                            date_str = str(date_val).split('T')[0]
                    price_records.append({'Date': date_str, 'Close': float(price_val)})
                except Exception as e:
                    self.error_logger.warning(f"Error processing price record for {ticker}: {e}")
                    continue
            logging.info(f"Processed {len(price_records)} price records for {ticker}")
            return price_records
        except Exception as e:
            self.error_logger.error(f"Error processing price DataFrame for {ticker}: {e}")
            return []
    def _find_price_column(self, df: pd.DataFrame) -> Optional[str]:
        if 'Adj Close' in df.columns:
            return 'Adj Close'
        elif 'Close' in df.columns:
            return 'Close'
        else:
            for col in df.columns:
                if col not in ['Date', 'Volume'] and pd.api.types.is_numeric_dtype(df[col]):
                    return col
        return None
