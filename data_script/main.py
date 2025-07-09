from data_script.config import Config
from data_script.logger import Logger
from data_script.excel_processor import ExcelDataProcessor
from data_script.price_manager import PriceDataManager
from data_script.stock_fetcher import StockDataFetcher
from data_script.company_processor import CompanyDataProcessor
import logging
import time
from datetime import datetime, timedelta
import json

class StockDataProcessor:
    """Main orchestrator class."""
    def __init__(self, config: Config):
        self.config = config
        self.logger = Logger(config.LOGS_DIR)
        self.excel_processor = ExcelDataProcessor(self.logger.error_logger)
        self.price_manager = PriceDataManager(config.DETAILS_DIR, self.logger.error_logger, config.PRICE_UPDATE_DAYS)
        self.fetcher = StockDataFetcher(config.BATCH_SIZE, config.API_DELAY, self.logger.error_logger)
        self.company_processor = CompanyDataProcessor(config.DETAILS_DIR, self.logger.error_logger)
    def run(self):
        logging.info(f"Script launched with config: {self.config}")
        company_data = self.excel_processor.read_excel_data(self.config.EXCEL_FILE, self.config.YEARS)
        summary_list = []
        tickers = list(company_data.keys())
        current_date = datetime.now().date()
        for i in range(0, len(tickers), self.config.BATCH_SIZE):
            batch_tickers = tickers[i:i + self.config.BATCH_SIZE]
            logging.info(f'Processing batch {i//self.config.BATCH_SIZE + 1}: tickers {i + 1} to {i + len(batch_tickers)}')
            full_update_tickers, partial_update_tickers = self._categorize_tickers(batch_tickers, current_date)
            price_data = {}
            if full_update_tickers:
                logging.info(f"Fetching full updates for: {full_update_tickers}")
                price_data.update(self.fetcher.fetch_batch_prices(full_update_tickers))
            for ticker, start_date in partial_update_tickers.items():
                logging.info(f"Fetching partial update for {ticker} from {start_date}")
                end_date = current_date + timedelta(days=1)
                df = self.fetcher.fetch_single_price(ticker, start_date, end_date)
                if df is not None:
                    price_data[ticker] = df
            for ticker in batch_tickers:
                ticker_price_data = price_data.get(ticker)
                if ticker_price_data is not None:
                    processed_prices = self.price_manager.process_price_dataframe(ticker_price_data, ticker)
                else:
                    processed_prices = []
                summary_entry = self.company_processor.process_company(
                    ticker, company_data[ticker], processed_prices
                )
                if summary_entry:
                    summary_list.append(summary_entry)
            if i + self.config.BATCH_SIZE < len(tickers):
                logging.info(f"Sleeping for {self.config.API_DELAY} seconds...")
                time.sleep(self.config.API_DELAY)
        self._save_summary(summary_list)
        logging.info(f"Processing completed. {len(summary_list)} companies processed.")
    def _categorize_tickers(self, tickers, current_date):
        full_update = []
        partial_update = {}
        for ticker in tickers:
            recent_date = self.price_manager.get_most_recent_price_date(ticker)
            if recent_date and (current_date - recent_date).days <= self.config.PRICE_UPDATE_DAYS:
                start_date = recent_date + timedelta(days=1)
                if start_date <= current_date:
                    partial_update[ticker] = start_date
                    logging.info(f"Partial update for {ticker} from {start_date} (last data: {recent_date})")
                else:
                    logging.info(f"No update needed for {ticker} (last data: {recent_date})")
            else:
                full_update.append(ticker)
                logging.info(f"Full update for {ticker} (last data: {recent_date})")
        return full_update, partial_update
    def _save_summary(self, summary_list):
        try:
            with open(self.config.SUMMARY_FILE, 'w') as f:
                json.dump(summary_list, f, indent=4, default=str)
            logging.info(f"Summary saved to {self.config.SUMMARY_FILE}")
        except Exception as e:
            self.logger.error_logger.error(f"Error saving summary: {str(e)}")

def main():
    config = Config()
    processor = StockDataProcessor(config)
    processor.run()

if __name__ == "__main__":
    main()
