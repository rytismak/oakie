import pandas as pd
import yfinance as yf
import logging
from typing import Dict, List, Optional

class StockDataFetcher:
    """Handles fetching stock data from yfinance."""
    def __init__(self, batch_size: int, api_delay: int, error_logger):
        self.batch_size = batch_size
        self.api_delay = api_delay
        self.error_logger = error_logger
    def fetch_batch_prices(self, tickers: List[str], period: str = '1y') -> Dict[str, pd.DataFrame]:
        try:
            logging.info(f"Fetching batch data for {len(tickers)} tickers: {tickers}")
            if len(tickers) == 1:
                ticker = tickers[0]
                df = yf.download(ticker, period=period, interval='1d', progress=False, auto_adjust=True)
                return {ticker: df} if not df.empty else {}
            df = yf.download(tickers, period=period, interval='1d', group_by='ticker', progress=False, auto_adjust=True)
            if df.empty:
                return {}
            result = {}
            for ticker in tickers:
                try:
                    if isinstance(df.columns, pd.MultiIndex):
                        if ticker in df.columns.get_level_values(0):
                            ticker_df = df[ticker].dropna()
                            if not ticker_df.empty:
                                result[ticker] = ticker_df
                    else:
                        result[ticker] = df
                except Exception as e:
                    self.error_logger.warning(f"Error extracting data for {ticker}: {e}")
                    continue
            logging.info(f"Successfully fetched data for {len(result)} out of {len(tickers)} tickers")
            return result
        except Exception as e:
            self.error_logger.error(f"Error fetching batch data for {tickers}: {str(e)}")
            return {}
    def fetch_single_price(self, ticker: str, start_date, end_date) -> Optional[pd.DataFrame]:
        try:
            logging.info(f"Fetching single ticker data for {ticker} from {start_date} to {end_date}")
            df = yf.download(ticker, start=start_date, end=end_date, interval='1d', progress=False, auto_adjust=True)
            if df.empty:
                logging.warning(f"No data returned for {ticker} in date range {start_date} to {end_date}")
                return None
            logging.info(f"Fetched {len(df)} records for {ticker}")
            return df
        except Exception as e:
            self.error_logger.error(f"Error fetching data for {ticker}: {str(e)}")
            return None
