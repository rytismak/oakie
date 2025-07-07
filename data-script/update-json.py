import pandas as pd
import yfinance as yf
import os
import json
import time
import logging
from datetime import datetime, timedelta

# ================================
# Configuration
# ================================
EXCEL_FILE = '10-companies.xlsx'  # <-- Put your file name here
DETAILS_DIR = 'details'
LOGS_DIR = 'logs'
SUMMARY_FILE = 'companies.json'
YEARS = ['2023', '2024']
BATCH_SIZE = 20
API_DELAY = 3  # seconds

# ================================
# Setup
# ================================
os.makedirs(DETAILS_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)
logging.basicConfig(filename=os.path.join(LOGS_DIR, 'errors.log'), level=logging.ERROR)

# ================================
# Read Excel Data
# ================================
company_data = {}

for year in YEARS:
    df = pd.read_excel(EXCEL_FILE, sheet_name=year)
    for _, row in df.iterrows():
        ticker = row['ticker']
        if pd.isna(ticker):
            continue
        if ticker not in company_data:
            company_data[ticker] = {
                'Company': row['Company'],
                'Ticker': ticker,
                'Sector': row['Primary Sector'],
                'Description': row['Description'],
                'Years': {}
            }
        company_data[ticker]['Years'][year] = {
            'DCFValue': row['DCF value'],
            'ExitMultipleValue': row['Exit multiple value'],
            'MarketCap': row['MarketCap'],
            'PerformanceMetrics': row.iloc[12:21].to_dict(),  # Columns M-U (assuming 0-based index)
            'PerformanceEvaluations': row.iloc[21:29].to_dict()  # Columns V-AC
        }

# ================================
# Fetch Stock Prices
# ================================
tickers = list(company_data.keys())
summary_list = []

for i in range(0, len(tickers), BATCH_SIZE):
    batch = tickers[i:i + BATCH_SIZE]
    print(f'Processing tickers {i + 1} to {i + len(batch)} of {len(tickers)}...')

    try:
        data = yf.download(batch, period='5y', interval='1d', group_by='ticker', progress=False)
    except Exception as e:
        logging.error(f"Error fetching batch {batch}: {str(e)}")
        continue

    for ticker in batch:
        try:
            company = company_data[ticker]

            # Extract historical prices
            if ticker in data:
                prices = data[ticker].reset_index()[['Date', 'Close']].to_dict(orient='records')
            else:
                # Single ticker response structure
                prices = data.reset_index()[['Date', 'Close']].to_dict(orient='records')

            # Build detailed JSON
            detailed_json = {
                'Company': company['Company'],
                'Ticker': company['Ticker'],
                'Sector': company['Sector'],
                'Description': company['Description'],
                'Years': company['Years'],
                'HistoricalPrices': prices
            }

            # Calculate Points for the most recent year (2024)
            latest_year = '2024' if '2024' in company['Years'] else '2023'
            latest_metrics = company['Years'][latest_year]['PerformanceMetrics']
            latest_evaluations = company['Years'][latest_year]['PerformanceEvaluations']
            points = sum(1 for value in latest_evaluations.values() if value == '✅')

            # Add Points to detailed JSON
            detailed_json['Points'] = points

            # Save detailed JSON
            with open(os.path.join(DETAILS_DIR, f'{ticker}.json'), 'w') as f:
                json.dump(detailed_json, f, indent=4, default=str)

            # Prepare summary entry
            try:
                current_price = prices[-1]['Close'] if prices else None
            except Exception:
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
                'LatestPerformanceMetrics': latest_metrics,
                'LatestPerformanceEvaluations': latest_evaluations
            })

        except Exception as e:
            logging.error(f"Error processing {ticker}: {str(e)}")
            continue

    time.sleep(API_DELAY)

# ================================
# Save Summary JSON
# ================================
with open(SUMMARY_FILE, 'w') as f:
    json.dump(summary_list, f, indent=4, default=str)

print('Processing completed successfully!')
