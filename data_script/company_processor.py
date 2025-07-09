import os
import json
import logging
import pandas as pd
from datetime import datetime
from typing import Dict, List, Optional
from .excel_processor import ExcelDataProcessor

class CompanyDataProcessor:
    """Processes company data and generates JSON files."""
    def __init__(self, details_dir: str, error_logger):
        self.details_dir = details_dir
        self.error_logger = error_logger

    def process_company(self, ticker: str, company_data: dict, price_data: list) -> dict:
        try:
            ticker_file_path = os.path.join(self.details_dir, f'{ticker}.json')
            detailed_json = self._load_or_create_json(ticker_file_path, company_data)
            merged_prices = self._merge_prices(
                detailed_json.get('HistoricalPrices', []), price_data
            )
            # --- NEW LOGIC: Fill missing recent trading days (last 30 days) ---
            from pandas.tseries.offsets import BDay
            import pandas as pd
            if merged_prices:
                all_dates = [x['Date'] for x in merged_prices]
                last_date = max(all_dates)
                today = pd.Timestamp.today().normalize()
                start_check = (today - pd.Timedelta(days=30)).strftime('%Y-%m-%d')
                end_check = today.strftime('%Y-%m-%d')
                business_days = pd.bdate_range(start=start_check, end=end_check).strftime('%Y-%m-%d').tolist()
                missing_days = [d for d in business_days if d not in all_dates and d <= last_date]
                if missing_days:
                    try:
                        import yfinance as yf
                        df_missing = yf.download(ticker, start=start_check, end=(today+pd.Timedelta(days=1)).strftime('%Y-%m-%d'), interval='1d', progress=False, auto_adjust=True)
                        if not df_missing.empty:
                            df_missing = df_missing.reset_index()
                            for _, row in df_missing.iterrows():
                                date_str = row['Date'].strftime('%Y-%m-%d') if isinstance(row['Date'], pd.Timestamp) else str(row['Date'])
                                if date_str in missing_days:
                                    close_val = row['Adj Close'] if 'Adj Close' in row else row['Close'] if 'Close' in row else None
                                    if close_val is not None and close_val > 0:
                                        merged_prices.append({'Date': date_str, 'Close': float(close_val)})
                            merged_prices = self._merge_prices(merged_prices, [])
                    except Exception as e:
                        self.error_logger.warning(f"Error fetching missing days for {ticker}: {e}")
            detailed_json['HistoricalPrices'] = merged_prices
            latest_year = self._get_latest_year(company_data)
            if latest_year:
                metrics_result = self._calculate_metrics(company_data, latest_year)
                detailed_json.update(metrics_result)
            detailed_json['Years'] = self._clean_years_data(company_data.get('Years', {}))
            with open(ticker_file_path, 'w') as f:
                json.dump(detailed_json, f, indent=4, default=str)
            logging.info(f"Successfully processed and saved data for {ticker}")
            return self._create_summary_entry(detailed_json, company_data, latest_year)
        except Exception as e:
            self.error_logger.error(f"Error processing company {ticker}: {str(e)}")
            return None

    def _load_or_create_json(self, file_path: str, company_data: dict) -> dict:
        import os, json
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

    def _merge_prices(self, existing_prices: list, new_prices: list) -> list:
        from datetime import datetime
        unique_prices = {}
        for item in existing_prices:
            if 'Date' in item and 'Close' in item:
                try:
                    date_str = str(item['Date']).split('T')[0]
                    datetime.strptime(date_str, '%Y-%m-%d')
                    unique_prices[date_str] = {
                        'Date': date_str,
                        'Close': float(item['Close'])
                    }
                except (ValueError, TypeError) as e:
                    self.error_logger.warning(f"Invalid existing price record: {item}, error: {e}")
                    continue
        for item in new_prices:
            if 'Date' in item and 'Close' in item:
                try:
                    date_str = str(item['Date']).split('T')[0]
                    datetime.strptime(date_str, '%Y-%m-%d')
                    unique_prices[date_str] = {
                        'Date': date_str,
                        'Close': float(item['Close'])
                    }
                except (ValueError, TypeError) as e:
                    self.error_logger.warning(f"Invalid new price record: {item}, error: {e}")
                    continue
        sorted_prices = sorted(unique_prices.values(), key=lambda x: x['Date'])
        import logging
        logging.info(f"Merged prices: {len(existing_prices)} existing + {len(new_prices)} new = {len(sorted_prices)} total")
        return sorted_prices

    def _get_latest_year(self, company_data: dict) -> str:
        years = company_data.get('Years', {})
        return '2024' if '2024' in years else '2023' if '2023' in years else None

    def _calculate_metrics(self, company_data: dict, latest_year: str) -> dict:
        import pandas as pd
        from .excel_processor import ExcelDataProcessor
        year_data = company_data['Years'][latest_year]
        metrics_raw = year_data['PerformanceMetricsRaw']
        evaluations_raw = year_data['PerformanceEvaluationsRaw']
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

    def _clean_years_data(self, years_data: dict) -> dict:
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

    def _create_summary_entry(self, detailed_json: dict, company_data: dict, latest_year: str) -> dict:
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
