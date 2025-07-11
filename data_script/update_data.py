import pandas as pd
import yfinance as yf
import os
import json
import time
import logging
from datetime import datetime
import glob
import math

# ================================
# Configuration
# ================================
EXCEL_FILE = 'data_script/input.xlsx'  # Set your file path here
DETAILS_DIR = 'public/companies-data/details'
LOGS_DIR = 'data_script/logs'
SUMMARY_FILE = 'public/companies-data/companies.json'
YEARS = ['2023', '2024']
BATCH_SIZE = 20
API_DELAY = 5  # seconds
PERIOD = '5y'
INTERVAL = '1d'
GROUP_BY = 'ticker'
AUTO_ADJUST = False

# ================================
# Setup
# ================================
os.makedirs(DETAILS_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)
log_file_path = os.path.join(LOGS_DIR, 'run.log')

logging.basicConfig(filename=log_file_path,
                    level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

start_time = datetime.now()
logging.info("Script started.")

# ================================
# Clean output directories and files
# ================================
# Remove all JSON files in DETAILS_DIR
for file in glob.glob(os.path.join(DETAILS_DIR, '*.json')):
    try:
        os.remove(file)
        logging.info(f"Deleted old details file: {file}")
    except Exception as e:
        logging.error(f"Could not delete file {file}: {str(e)}")
# Remove companies.json if it exists
if os.path.exists(SUMMARY_FILE):
    try:
        os.remove(SUMMARY_FILE)
        logging.info(f"Deleted old summary file: {SUMMARY_FILE}")
    except Exception as e:
        logging.error(f"Could not delete summary file {SUMMARY_FILE}: {str(e)}")

# ================================
# Read Excel Data
# ================================
company_data = {}
try:
    for year in YEARS:
        df = pd.read_excel(EXCEL_FILE, sheet_name=year)
        for _, row in df.iterrows():
            ticker = row['ticker']
            if pd.isna(ticker):
                continue
            if ticker not in company_data:
                company_data[ticker] = {
                    'Company': row['Company'] if not pd.isna(row['Company']) else "",
                    'Ticker': ticker,
                    'Sector': row['Primary Sector'] if not pd.isna(row['Primary Sector']) else "",
                    'Description': row['Description'] if not pd.isna(row['Description']) else "",
                    'Years': {}
                }
            # Build metrics and evaluations by column name, not by index
            metric_names = [
                'FCF yield', 'NOPAT', 'ROIC', 'ReinvRate', 'D/E', 'ICR', 'OMS', 'EV/OCF', 'EVA/InvCap'
            ]
            combined = {}
            for metric in metric_names:
                value = row.get(metric)
                if pd.isna(value):
                    value = ""
                eval_col = metric + ' Evaluation'
                eval_value = row.get(eval_col) if eval_col in row else None
                if pd.isna(eval_value):
                    eval_value = ""
                combined[metric] = {
                    'Value': value,
                    'Evaluation': eval_value
                }
            company_data[ticker]['Years'][year] = {
                'DCFValue': row['DCF value'] if not pd.isna(row['DCF value']) else "",
                'ExitMultipleValue': row['Exit multiple value'] if not pd.isna(row['Exit multiple value']) else "",
                'MarketCap': row['MarketCap'] if not pd.isna(row['MarketCap']) else "",
                'PerformanceMetrics': combined
            }
    logging.info(f"Parsed Excel: {len(company_data)} companies loaded from sheets {YEARS}.")
except Exception as e:
    logging.error(f"Error reading Excel: {str(e)}")
    raise

# ================================
# Fetch Stock Prices
# ================================
tickers = list(company_data.keys())
summary_list = []
total_files_created = 0
api_batches = 0

for i in range(0, len(tickers), BATCH_SIZE):
    batch = tickers[i:i + BATCH_SIZE]
    api_batches += 1
    print(f'Processing tickers {i + 1} to {i + len(batch)} of {len(tickers)}...')
    try:
        api_start = time.time()
        logging.info(f"API request: yf.download(batch={batch}, period='{PERIOD}', interval='{INTERVAL}', group_by='{GROUP_BY}', progress=False, auto_adjust={AUTO_ADJUST})")
        data = yf.download(batch, period=PERIOD, interval=INTERVAL, group_by=GROUP_BY, progress=False, auto_adjust=AUTO_ADJUST)
        api_end = time.time()
        logging.info(f"API request for batch {batch} completed in {api_end - api_start:.2f} seconds.")
    except Exception as e:
        logging.error(f"Error fetching batch {batch}: {str(e)}")
        continue

    for ticker in batch:
        try:
            company = company_data[ticker]

            # Extract prices
            try:
                if ticker in data.columns.get_level_values(0):
                    prices = data[ticker].reset_index()[['Date', 'Close']].to_dict(orient='records')
                else:
                    prices = data.reset_index()[['Date', 'Close']].to_dict(orient='records')
            except:
                prices = []

            latest_year = '2024' if '2024' in company['Years'] else '2023'
            perf_metrics = company['Years'][latest_year]['PerformanceMetrics']

            # Calculate Points
            points = sum(1 for v in perf_metrics.values() if v['Evaluation'] == 'Strong') - sum(1 for v in perf_metrics.values() if v['Evaluation'] == 'Weak')

            # Calculate Comparatives
            strong = sum(1 for v in perf_metrics.values() if v['Evaluation'] == 'Strong')
            weak = sum(1 for v in perf_metrics.values() if v['Evaluation'] == 'Weak')
            comparatives = (strong / weak ) if weak > 0 else float('inf') if strong > 0 else 0.0

            # Build detailed JSON
            detailed_json = {
                'Company': company['Company'],
                'Ticker': company['Ticker'],
                'Sector': company['Sector'],
                'Description': company['Description'],
                'Years': company['Years'],
                'HistoricalPrices': prices,
                'Points': points,
                'Comparatives': comparatives
            }

            def clean_nan_to_empty_str(obj):
                if isinstance(obj, float) and math.isnan(obj):
                    return ""
                if isinstance(obj, dict):
                    return {k: clean_nan_to_empty_str(v) for k, v in obj.items()}
                if isinstance(obj, list):
                    return [clean_nan_to_empty_str(x) for x in obj]
                return obj

            with open(os.path.join(DETAILS_DIR, f'{ticker}.json'), 'w') as f:
                json.dump(clean_nan_to_empty_str(detailed_json), f, indent=4, default=str)
                total_files_created += 1

            # Summary entry
            # Find the latest available (non-NaN) price
            current_price = None
            if prices:
                # Iterate backwards to find the most recent non-NaN price
                for price_entry in reversed(prices):
                    price_val = price_entry.get('Close')
                    if price_val is not None and not (isinstance(price_val, float) and math.isnan(price_val)):
                        current_price = price_val
                        break
                # If the latest price is NaN, log an error
                latest_price_val = prices[-1].get('Close')
                if latest_price_val is None or (isinstance(latest_price_val, float) and math.isnan(latest_price_val)):
                    logging.error(f"Latest price for {ticker} is NaN or None. Using most recent non-NaN price: {current_price}")
            else:
                current_price = None

            summary_list.append({
                'Company': company['Company'],
                'Ticker': company['Ticker'],
                'Sector': company['Sector'],
                'Description': company['Description'],
                'CurrentPrice': current_price,
                'MarketCap': company['Years'][latest_year]['MarketCap'],
                'DCFValue': company['Years'][latest_year]['DCFValue'],
                'ExitMultipleValue': company['Years'][latest_year]['ExitMultipleValue'],
                'Points': points,
                'Comparatives': comparatives,
                'LatestPerformanceMetrics': perf_metrics
            })

        except Exception as e:
            logging.error(f"Error processing {ticker}: {str(e)}")
            continue

    time.sleep(API_DELAY)

# ================================
# Save Summary JSON
# ================================
try:
    with open(SUMMARY_FILE, 'w') as f:
        json.dump(summary_list, f, indent=4, default=str)
    logging.info(f"Summary JSON created: {SUMMARY_FILE}")
except Exception as e:
    logging.error(f"Error writing summary JSON: {str(e)}")

# ================================
# Final Log
# ================================
end_time = datetime.now()
duration = (end_time - start_time).total_seconds()
logging.info(f"Script completed in {duration:.2f} seconds.")
logging.info(f"API batches processed: {api_batches}")
logging.info(f"Company JSON files created: {total_files_created}")
