import pandas as pd
from typing import Dict, List

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
            return company_data
        except Exception as e:
            self.error_logger.error(f"Error reading Excel data: {str(e)}")
            raise
    def _validate_columns(self, df: pd.DataFrame, excel_file: str, year: str):
        missing_metrics = [col for col in self.METRIC_COLUMNS if col not in df.columns]
        missing_evals = [col for col in self.EVALUATION_COLUMNS if col not in df.columns]
        if missing_metrics:
            self.error_logger.error(f"Missing metric columns in {excel_file} sheet {year}: {', '.join(missing_metrics)}")
            raise ValueError("Missing required Excel columns.")
        if missing_evals:
            self.error_logger.error(f"Missing evaluation columns in {excel_file} sheet {year}: {', '.join(missing_evals)}")
            raise ValueError("Missing required Excel columns.")
    def _create_company_record(self, row: pd.Series, ticker: str) -> Dict:
        return {
            'Company': row['Company'] if pd.notna(row['Company']) else None,
            'Ticker': ticker,
            'Sector': row['Primary Sector'] if pd.notna(row['Primary Sector']) else None,
            'Description': row['Description'] if pd.notna(row['Description']) else None,
            'Years': {}
        }
    def _process_year_data(self, row: pd.Series) -> Dict:
        metrics_dict = {col: row[col] for col in self.METRIC_COLUMNS if col in row and pd.notna(row[col])}
        evaluations_dict = {col: row[col] for col in self.EVALUATION_COLUMNS if col in row and pd.notna(row[col])}
        return {
            'DCFValue': row['DCF value'] if pd.notna(row['DCF value']) else None,
            'ExitMultipleValue': row['Exit multiple value'] if pd.notna(row['Exit multiple value']) else None,
            'MarketCap': row['MarketCap'] if pd.notna(row['MarketCap']) else None,
            'PerformanceMetricsRaw': metrics_dict,
            'PerformanceEvaluationsRaw': evaluations_dict
        }
