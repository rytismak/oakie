import pandas as pd
import yfinance as yf
import os
import json
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

@dataclass
class Config:
    """Configuration settings for the stock data processor."""
    EXCEL_FILE: str = '10-companies.xlsx'
    DETAILS_DIR: str = 'details'
    LOGS_DIR: str = 'logs'
    SUMMARY_FILE: str = 'companies.json'
    YEARS: List[str] = None
    BATCH_SIZE: int = 20
    API_DELAY: int = 3
    PRICE_UPDATE_DAYS: int = 30
    
    def __post_init__(self):
        if self.YEARS is None:
            self.YEARS = ['2023', '2024']

class Logger:
    """Handles logging configuration and management."""
    
    def __init__(self, logs_dir: str):
        self.logs_dir = logs_dir
        os.makedirs(logs_dir, exist_ok=True)
        self._setup_logging()
    
    def _setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(os.path.join(self.logs_dir, 'activity.log')),
                logging.StreamHandler()
            ]
        )
        
        self.error_logger = logging.getLogger('error_logger')
        self.error_logger.setLevel(logging.ERROR)
        error_handler = logging.FileHandler(os.path.join(self.logs_dir, 'errors.log'))
        error_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
        self.error_logger.addHandler(error_handler)

class ExcelDataProcessor:
    """Handles reading and processing Excel data."""
    
    METRIC_COLUMNS = [
        'FCF yield', 'NOPAT', 'ROIC', 'ReinvRate', 'D/E', 'ICR', 'OMS', 'EV/OCF', 'EVA/InvCap'
    ]
    
    EVALUATION_COLUMNS = [
        'FCF yield Evaluation', 'ROIC Evaluation', 'ReinvRate Evaluation',
        'D/E Evaluation', 'ICR Evaluation', 'OMS Evaluation', 'EV/OCF Evaluation',
        'EVA/InvCap Evaluation'
    ]
    
    def __init__(self, error_logger):
        self.error_logger = error_logger
    
    def read_excel_data(self, excel_file: str, years: List[str]) -> Dict:
        """Read and process Excel data for all years."""
        company_data = {}
        companies_parsed_count = 0
        
        try:
            for year in years:
                df = pd.read_excel(excel_file, sheet_name=year)
                self._validate_columns(df, excel_file, year)
                
                for _, row in df.iterrows():
                    ticker = str(row['ticker']).strip()
                    if pd.isna(ticker) or not ticker:
                        continue
                    
                    if ticker not in company_data:
                        company_data[ticker] = self._create_company_record(row, ticker)
                        companies_parsed_count += 1
                    
                    company_data[ticker]['Years'][year] = self._process_year_data(row)
            
            logging.info(f"Successfully parsed {companies_parsed_count} unique companies from Excel file.")
            return company_data
            
        except Exception as e:
            self.error_logger.error(f"Error reading Excel data: {str(e)}")
            raise
    
    def _validate_columns(self, df: pd.DataFrame, excel_file: str, year: str):
        """Validate that required columns exist in the DataFrame."""
        missing_metrics = [col for col in self.METRIC_COLUMNS if col not in df.columns]
        missing_evals = [col for col in self.EVALUATION_COLUMNS if col not in df.columns]
        
        if missing_metrics:
            self.error_logger.error(f"Missing metric columns in {excel_file} sheet {year}: {', '.join(missing_metrics)}")
            raise ValueError("Missing required Excel columns.")
        if missing_evals:
            self.error_logger.error(f"Missing evaluation columns in {excel_file} sheet {year}: {', '.join(missing_evals)}")
            raise ValueError("Missing required Excel columns.")
    
    def _create_company_record(self, row: pd.Series, ticker: str) -> Dict:
        """Create a new company record from Excel row."""
        return {
            'Company': row['Company'] if pd.notna(row['Company']) else None,
            'Ticker': ticker,
            'Sector': row['Primary Sector'] if pd.notna(row['Primary Sector']) else None,
            'Description': row['Description'] if pd.notna(row['Description']) else None,
            'Years': {}
        }
    
    def _process_year_data(self, row: pd.Series) -> Dict:
        """Process year-specific data from Excel row."""
        metrics_dict = {col: row[col] for col in self.METRIC_COLUMNS if col in row and pd.notna(row[col])}
        evaluations_dict = {col: row[col] for col in self.EVALUATION_COLUMNS if col in row and pd.notna(row[col])}
        
        return {
            'DCFValue': row['DCF value'] if pd.notna(row['DCF value']) else None,
            'ExitMultipleValue': row['Exit multiple value'] if pd.notna(row['Exit multiple value']) else None,
            'MarketCap': row['MarketCap'] if pd.notna(row['MarketCap']) else None,
            'PerformanceMetricsRaw': metrics_dict,
            'PerformanceEvaluationsRaw': evaluations_dict
        }

class PriceDataManager:
    """Manages stock price data fetching and processing."""
    
    def __init__(self, details_dir: str, error_logger, price_update_days: int = 30):
        self.details_dir = details_dir
        self.error_logger = error_logger
        self.price_update_days = price_update_days
        os.makedirs(details_dir, exist_ok=True)
    
    def get_most_recent_price_date(self, ticker: str) -> Optional[datetime.date]:
        """Get the most recent price date for a ticker."""
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
                        # Handle different date formats
                        date_str = str(p['Date']).split('T')[0]  # Remove time component if present
                        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
                        valid_prices.append(date_obj)
                    except (ValueError, TypeError):
                        continue
            
            return max(valid_prices) if valid_prices else None
            
        except Exception as e:
            self.error_logger.warning(f"Could not read historical prices for {ticker}: {e}")
            return None
    
    def process_price_dataframe(self, df: pd.DataFrame, ticker: str) -> List[Dict]:
        """Process a price DataFrame and convert it to a list of price records."""
        if df is None or df.empty:
            return []
        
        try:
            # Reset index to make Date a column if it's currently the index
            if 'Date' not in df.columns:
                df = df.reset_index()
            
            # Find the price column
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
                    
                    # Convert date to consistent format
                    if isinstance(date_val, pd.Timestamp):
                        date_str = date_val.strftime('%Y-%m-%d')
                    else:
                        # Try to parse the date string
                        try:
                            parsed_date = pd.to_datetime(date_val)
                            date_str = parsed_date.strftime('%Y-%m-%d')
                        except:
                            date_str = str(date_val).split('T')[0]  # Remove time if present
                    
                    price_records.append({
                        'Date': date_str,
                        'Close': float(price_val)
                    })
                except Exception as e:
                    self.error_logger.warning(f"Error processing price record for {ticker}: {e}")
                    continue
            
            logging.info(f"Processed {len(price_records)} price records for {ticker}")
            return price_records
            
        except Exception as e:
            self.error_logger.error(f"Error processing price DataFrame for {ticker}: {e}")
            return []
    
    def _find_price_column(self, df: pd.DataFrame) -> Optional[str]:
        """Find the appropriate price column in the DataFrame."""
        if 'Adj Close' in df.columns:
            return 'Adj Close'
        elif 'Close' in df.columns:
            return 'Close'
        else:
            # Look for any numeric column that's not Date or Volume
            for col in df.columns:
                if col not in ['Date', 'Volume'] and pd.api.types.is_numeric_dtype(df[col]):
                    return col
        return None

class StockDataFetcher:
    """Handles fetching stock data from yfinance."""
    
    def __init__(self, batch_size: int, api_delay: int, error_logger):
        self.batch_size = batch_size
        self.api_delay = api_delay
        self.error_logger = error_logger
    
    def fetch_batch_prices(self, tickers: List[str], period: str = '1y') -> Dict[str, pd.DataFrame]:
        """Fetch prices for multiple tickers."""
        try:
            logging.info(f"Fetching batch data for {len(tickers)} tickers: {tickers}")
            
            # Handle single ticker case
            if len(tickers) == 1:
                ticker = tickers[0]
                df = yf.download(ticker, period=period, interval='1d', 
                               progress=False, auto_adjust=True)
                return {ticker: df} if not df.empty else {}
            
            # Handle multiple tickers
            df = yf.download(tickers, period=period, interval='1d', 
                           group_by='ticker', progress=False, auto_adjust=True)
            
            if df.empty:
                return {}
            
            result = {}
            for ticker in tickers:
                try:
                    if isinstance(df.columns, pd.MultiIndex):
                        # Multi-ticker download
                        if ticker in df.columns.get_level_values(0):
                            ticker_df = df[ticker].dropna()
                            if not ticker_df.empty:
                                result[ticker] = ticker_df
                    else:
                        # Single ticker case (shouldn't happen here but just in case)
                        result[ticker] = df
                except Exception as e:
                    self.error_logger.warning(f"Error extracting data for {ticker}: {e}")
                    continue
            
            logging.info(f"Successfully fetched data for {len(result)} out of {len(tickers)} tickers")
            return result
            
        except Exception as e:
            self.error_logger.error(f"Error fetching batch data for {tickers}: {str(e)}")
            return {}
    
    def fetch_single_price(self, ticker: str, start_date: datetime.date, end_date: datetime.date) -> Optional[pd.DataFrame]:
        """Fetch prices for a single ticker within a date range."""
        try:
            logging.info(f"Fetching single ticker data for {ticker} from {start_date} to {end_date}")
            
            df = yf.download(ticker, start=start_date, end=end_date, 
                           interval='1d', progress=False, auto_adjust=True)
            
            if df.empty:
                logging.warning(f"No data returned for {ticker} in date range {start_date} to {end_date}")
                return None
            
            logging.info(f"Fetched {len(df)} records for {ticker}")
            return df
            
        except Exception as e:
            self.error_logger.error(f"Error fetching data for {ticker}: {str(e)}")
            return None

class CompanyDataProcessor:
    """Processes company data and generates JSON files."""
    
    def __init__(self, details_dir: str, error_logger):
        self.details_dir = details_dir
        self.error_logger = error_logger
    
    def process_company(self, ticker: str, company_data: Dict, price_data: List[Dict]) -> Dict:
        """Process a single company's data and save to JSON. Now also fills missing recent days."""
        try:
            ticker_file_path = os.path.join(self.details_dir, f'{ticker}.json')
            # Load existing data or create new
            detailed_json = self._load_or_create_json(ticker_file_path, company_data)
            # Update prices - this is the key fix
            merged_prices = self._merge_prices(
                detailed_json.get('HistoricalPrices', []), price_data
            )
            # --- NEW LOGIC: Fill missing recent trading days (last 30 days) ---
            from pandas.tseries.offsets import BDay
            import pandas as pd
            if merged_prices:
                all_dates = [x['Date'] for x in merged_prices]
                last_date = max(all_dates)
                # Only check for missing days in the last 30 calendar days
                today = pd.Timestamp.today().normalize()
                start_check = (today - pd.Timedelta(days=30)).strftime('%Y-%m-%d')
                end_check = today.strftime('%Y-%m-%d')
                # Generate all business days in the range
                business_days = pd.bdate_range(start=start_check, end=end_check).strftime('%Y-%m-%d').tolist()
                missing_days = [d for d in business_days if d not in all_dates and d <= last_date]
                if missing_days:
                    # Fetch missing days from yfinance
                    try:
                        df_missing = yf.download(ticker, start=start_check, end=(today+pd.Timedelta(days=1)).strftime('%Y-%m-%d'), interval='1d', progress=False, auto_adjust=True)
                        if not df_missing.empty:
                            df_missing = df_missing.reset_index()
                            for _, row in df_missing.iterrows():
                                date_str = row['Date'].strftime('%Y-%m-%d') if isinstance(row['Date'], pd.Timestamp) else str(row['Date'])
                                if date_str in missing_days:
                                    close_val = row['Adj Close'] if 'Adj Close' in row else row['Close'] if 'Close' in row else None
                                    if close_val is not None and close_val > 0:
                                        merged_prices.append({'Date': date_str, 'Close': float(close_val)})
                            # Re-merge to remove any duplicates
                            merged_prices = self._merge_prices(merged_prices, [])
                    except Exception as e:
                        self.error_logger.warning(f"Error fetching missing days for {ticker}: {e}")
            # --- END NEW LOGIC ---
            detailed_json['HistoricalPrices'] = merged_prices
            # Calculate metrics
            latest_year = self._get_latest_year(company_data)
            if latest_year:
                metrics_result = self._calculate_metrics(company_data, latest_year)
                detailed_json.update(metrics_result)
            # Clean up years data
            detailed_json['Years'] = self._clean_years_data(company_data.get('Years', {}))
            # Save JSON
            with open(ticker_file_path, 'w') as f:
                json.dump(detailed_json, f, indent=4, default=str)
            
            logging.info(f"Successfully processed and saved data for {ticker}")
            
            # Return summary data
            return self._create_summary_entry(detailed_json, company_data, latest_year)
            
        except Exception as e:
            self.error_logger.error(f"Error processing company {ticker}: {str(e)}")
            return None
    
    def _load_or_create_json(self, file_path: str, company_data: Dict) -> Dict:
        """Load existing JSON or create new one."""
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                self.error_logger.warning(f"Corrupt JSON at {file_path}, recreating")
        
        return {
            'Company': company_data.get('Company'),
            'Ticker': company_data.get('Ticker'),
            'Sector': company_data.get('Sector'),
            'Description': company_data.get('Description'),
            'HistoricalPrices': []
        }
    
    def _merge_prices(self, existing_prices: List[Dict], new_prices: List[Dict]) -> List[Dict]:
        """Merge existing and new price data, removing duplicates."""
        # Create a dictionary to store unique prices by date
        unique_prices = {}
        
        # Add existing prices
        for item in existing_prices:
            if 'Date' in item and 'Close' in item:
                try:
                    date_str = str(item['Date']).split('T')[0]  # Remove time component
                    # Validate date format
                    datetime.strptime(date_str, '%Y-%m-%d')
                    unique_prices[date_str] = {
                        'Date': date_str, 
                        'Close': float(item['Close'])
                    }
                except (ValueError, TypeError) as e:
                    self.error_logger.warning(f"Invalid existing price record: {item}, error: {e}")
                    continue
        
        # Add new prices (will overwrite existing ones if dates match)
        for item in new_prices:
            if 'Date' in item and 'Close' in item:
                try:
                    date_str = str(item['Date']).split('T')[0]  # Remove time component
                    # Validate date format
                    datetime.strptime(date_str, '%Y-%m-%d')
                    unique_prices[date_str] = {
                        'Date': date_str, 
                        'Close': float(item['Close'])
                    }
                except (ValueError, TypeError) as e:
                    self.error_logger.warning(f"Invalid new price record: {item}, error: {e}")
                    continue
        
        # Sort by date and return
        sorted_prices = sorted(unique_prices.values(), key=lambda x: x['Date'])
        logging.info(f"Merged prices: {len(existing_prices)} existing + {len(new_prices)} new = {len(sorted_prices)} total")
        return sorted_prices
    
    def _get_latest_year(self, company_data: Dict) -> Optional[str]:
        """Get the latest available year for the company."""
        years = company_data.get('Years', {})
        return '2024' if '2024' in years else '2023' if '2023' in years else None
    
    def _calculate_metrics(self, company_data: Dict, latest_year: str) -> Dict:
        """Calculate performance metrics and comparatives."""
        year_data = company_data['Years'][latest_year]
        metrics_raw = year_data['PerformanceMetricsRaw']
        evaluations_raw = year_data['PerformanceEvaluationsRaw']
        
        # Calculate combined metrics
        combined_metrics = {}
        strong_count = weak_count = 0
        
        for metric in ExcelDataProcessor.METRIC_COLUMNS:
            value = metrics_raw.get(metric)
            eval_key = f"{metric} Evaluation"
            evaluation = evaluations_raw.get(eval_key)
            
            if pd.isna(evaluation):
                evaluation = None
            
            if evaluation == 'Strong':
                strong_count += 1
            elif evaluation == 'Weak':
                weak_count += 1
            
            combined_metrics[metric] = {
                "Value": value if pd.notna(value) else None,
                "Evaluation": evaluation
            }
        
        # Calculate points and comparatives
        points = sum(1 for val in evaluations_raw.values() if val == '✅')
        
        if weak_count > 0:
            comparatives = (strong_count / weak_count) * 100
        elif strong_count > 0:
            comparatives = 1000000
        else:
            comparatives = None
        
        return {
            'Points': points,
            'Comparatives': comparatives,
            f'CombinedPerformanceMetrics_{latest_year}': combined_metrics
        }
    
    def _clean_years_data(self, years_data: Dict) -> Dict:
        """Clean years data by removing raw metrics."""
        cleaned = {}
        for year, data in years_data.items():
            if isinstance(data, dict):
                cleaned_data = data.copy()
                cleaned_data.pop('PerformanceMetricsRaw', None)
                cleaned_data.pop('PerformanceEvaluationsRaw', None)
                cleaned[year] = cleaned_data
            else:
                cleaned[year] = data
        return cleaned
    
    def _create_summary_entry(self, detailed_json: Dict, company_data: Dict, latest_year: str) -> Dict:
        """Create summary entry for the company."""
        prices = detailed_json.get('HistoricalPrices', [])
        current_price = prices[-1]['Close'] if prices else None
        
        return {
            'Company': company_data.get('Company'),
            'Ticker': company_data.get('Ticker'),
            'Sector': company_data.get('Sector'),
            'Description': company_data.get('Description'),
            'CurrentPrice': current_price,
            'MarketCap': company_data['Years'][latest_year]['MarketCap'] if latest_year else None,
            'DCFValue': company_data['Years'][latest_year]['DCFValue'] if latest_year else None,
            'ExitMultipleValue': company_data['Years'][latest_year]['ExitMultipleValue'] if latest_year else None,
            'Points': detailed_json.get('Points'),
            'Comparatives': detailed_json.get('Comparatives'),
            'LatestCombinedPerformanceMetrics': detailed_json.get(f'CombinedPerformanceMetrics_{latest_year}')
        }

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
        """Main execution method."""
        logging.info(f"Script launched with config: {self.config}")
        
        # Read Excel data
        company_data = self.excel_processor.read_excel_data(self.config.EXCEL_FILE, self.config.YEARS)
        
        # Process companies in batches
        summary_list = []
        tickers = list(company_data.keys())
        current_date = datetime.now().date()
        
        for i in range(0, len(tickers), self.config.BATCH_SIZE):
            batch_tickers = tickers[i:i + self.config.BATCH_SIZE]
            logging.info(f'Processing batch {i//self.config.BATCH_SIZE + 1}: tickers {i + 1} to {i + len(batch_tickers)}')
            
            # Determine which tickers need full vs partial updates
            full_update_tickers, partial_update_tickers = self._categorize_tickers(batch_tickers, current_date)
            
            # Fetch price data
            price_data = {}
            
            # Fetch full updates
            if full_update_tickers:
                logging.info(f"Fetching full updates for: {full_update_tickers}")
                price_data.update(self.fetcher.fetch_batch_prices(full_update_tickers))
            
            # Fetch partial updates
            for ticker, start_date in partial_update_tickers.items():
                logging.info(f"Fetching partial update for {ticker} from {start_date}")
                end_date = current_date + timedelta(days=1)
                df = self.fetcher.fetch_single_price(ticker, start_date, end_date)
                if df is not None:
                    price_data[ticker] = df
            
            # Process each company
            for ticker in batch_tickers:
                ticker_price_data = price_data.get(ticker)
                # Always process the company, even if no new price data is fetched
                if ticker_price_data is not None:
                    processed_prices = self.price_manager.process_price_dataframe(ticker_price_data, ticker)
                else:
                    # No new data fetched, but still process to ensure file is updated/cleaned
                    processed_prices = []

                summary_entry = self.company_processor.process_company(
                    ticker, company_data[ticker], processed_prices
                )

                if summary_entry:
                    summary_list.append(summary_entry)
            
            # Sleep between batches to avoid rate limiting
            if i + self.config.BATCH_SIZE < len(tickers):
                logging.info(f"Sleeping for {self.config.API_DELAY} seconds...")
                time.sleep(self.config.API_DELAY)
        
        # Save summary
        self._save_summary(summary_list)
        
        logging.info(f"Processing completed. {len(summary_list)} companies processed.")
    
    def _categorize_tickers(self, tickers: List[str], current_date: datetime.date) -> Tuple[List[str], Dict[str, datetime.date]]:
        """Categorize tickers into full vs partial updates."""
        full_update = []
        partial_update = {}
        
        for ticker in tickers:
            recent_date = self.price_manager.get_most_recent_price_date(ticker)
            
            if recent_date and (current_date - recent_date).days <= self.config.PRICE_UPDATE_DAYS:
                # Add one day to avoid duplicate dates
                start_date = recent_date + timedelta(days=1)
                if start_date <= current_date:  # Only update if there are days to fetch
                    partial_update[ticker] = start_date
                    logging.info(f"Partial update for {ticker} from {start_date} (last data: {recent_date})")
                else:
                    logging.info(f"No update needed for {ticker} (last data: {recent_date})")
            else:
                full_update.append(ticker)
                logging.info(f"Full update for {ticker} (last data: {recent_date})")
        
        return full_update, partial_update
    
    def _save_summary(self, summary_list: List[Dict]):
        """Save the summary JSON file."""
        try:
            with open(self.config.SUMMARY_FILE, 'w') as f:
                json.dump(summary_list, f, indent=4, default=str)
            logging.info(f"Summary saved to {self.config.SUMMARY_FILE}")
        except Exception as e:
            self.logger.error_logger.error(f"Error saving summary: {str(e)}")

def main():
    """Main entry point."""
    config = Config()
    processor = StockDataProcessor(config)
    processor.run()

if __name__ == "__main__":
    main()
