"""
Script to fetch company descriptions from Yahoo Finance and update CSV file.
"""

import pandas as pd
import yfinance as yf
import time
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('description_fetch.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def get_company_descriptions_batch(tickers):
    """
    Fetch company descriptions and key info for a batch of tickers from Yahoo Finance.
    
    Args:
        tickers (list): List of stock ticker symbols
        
    Returns:
        dict: Dictionary with ticker as key and dict of company info as value
              Format: {ticker: {'longBusinessSummary': str, 'industry': str, 'sector': str, ...}}
    """
    results = {}
    
    for ticker in tickers:
        try:
            print(f"Fetching company info for {ticker}...")
            
            # Create yfinance ticker object
            stock = yf.Ticker(ticker)
            
            # Get company info
            info = stock.info
            
            # Extract all relevant company information
            ticker_result = {
                'longBusinessSummary': info.get('longBusinessSummary', 'Not available'),
                'industry': info.get('industry', 'Not available'),
                'sector': info.get('sector', 'Not available'),
                'shortName': info.get('shortName', 'Not available'),
                'longName': info.get('longName', 'Not available'),
                'website': info.get('website', 'Not available'),
                'fullTimeEmployees': info.get('fullTimeEmployees', 'Not available'),
                'city': info.get('city', 'Not available'),
                'state': info.get('state', 'Not available'),
                'country': info.get('country', 'Not available')
            }
            
            # Create a short description from available fields
            short_description_parts = []
            if ticker_result['industry'] != 'Not available':
                short_description_parts.append(f"Industry: {ticker_result['industry']}")
            if ticker_result['sector'] != 'Not available':
                short_description_parts.append(f"Sector: {ticker_result['sector']}")
            if ticker_result['fullTimeEmployees'] != 'Not available':
                short_description_parts.append(f"Employees: {ticker_result['fullTimeEmployees']:,}")
            
            location_parts = []
            if ticker_result['city'] != 'Not available':
                location_parts.append(ticker_result['city'])
            if ticker_result['state'] != 'Not available':
                location_parts.append(ticker_result['state'])
            if ticker_result['country'] != 'Not available':
                location_parts.append(ticker_result['country'])
            
            if location_parts:
                short_description_parts.append(f"Location: {', '.join(location_parts)}")
            
            # Combine into a short description
            ticker_result['shortDescription'] = '; '.join(short_description_parts) if short_description_parts else 'Limited information available'
            
            # Check if we got any meaningful data
            meaningful_data = any(value != 'Not available' for key, value in ticker_result.items() if key != 'shortDescription')
            
            if not meaningful_data:
                error_msg = f"No company information available for {ticker}"
                print(f"Warning: {error_msg}")
                ticker_result = {field: error_msg for field in ticker_result.keys()}
            else:
                available_fields = [key for key, value in ticker_result.items() if value != 'Not available']
                print(f"✓ Successfully fetched {len(available_fields)} fields for {ticker}: {', '.join(available_fields[:3])}...")
            
            results[ticker] = ticker_result
                
        except Exception as e:
            error_msg = f"Error: {str(e)}"
            print(f"Error fetching company info for {ticker}: {str(e)}")
            logger.error(f"Error fetching company info for {ticker}: {str(e)}")
            results[ticker] = {
                'longBusinessSummary': error_msg,
                'industry': error_msg,
                'sector': error_msg,
                'shortName': error_msg,
                'longName': error_msg,
                'website': error_msg,
                'fullTimeEmployees': error_msg,
                'city': error_msg,
                'state': error_msg,
                'country': error_msg,
                'shortDescription': error_msg
            }
    
    return results

def process_tickers_csv(input_file_path, output_file_path=None, batch_size=30, delay=3):
    """
    Process CSV file with tickers and add descriptions using batching.
    
    Args:
        input_file_path (str): Path to input CSV file with tickers
        output_file_path (str): Path to output CSV file (optional)
        batch_size (int): Number of tickers to process per batch
        delay (float): Delay between batches in seconds
    """
    try:
        # Read the CSV file
        df = pd.read_csv(input_file_path)
        
        # Check if ticker column exists
        if 'ticker' not in df.columns:
            raise ValueError("CSV file must contain a 'ticker' column")
        
        # Add all company info columns if they don't exist
        columns_to_add = [
            'longBusinessSummary', 'industry', 'sector', 'shortName', 
            'longName', 'website', 'fullTimeEmployees', 'city', 
            'state', 'country', 'shortDescription'
        ]
        
        for column in columns_to_add:
            if column not in df.columns:
                df[column] = ''
        
        print(f"Processing {len(df)} tickers in batches of {batch_size}...")
        logger.info(f"Processing {len(df)} tickers in batches of {batch_size}...")
        
        # Get tickers that need processing (empty or missing descriptions)
        tickers_to_process = []
        ticker_indices = {}
        
        for index, row in df.iterrows():
            ticker = row['ticker']
            
            # Check if the row already has sufficient data
            columns_to_check = ['longBusinessSummary', 'industry', 'sector', 'shortDescription']
            missing_data = False
            
            for col in columns_to_check:
                existing_value = row.get(col, '')
                if (pd.isna(existing_value) or 
                    not str(existing_value).strip() or 
                    str(existing_value).startswith('Error:') or
                    str(existing_value).startswith('No ') or
                    str(existing_value) == 'Not available'):
                    missing_data = True
                    break
            
            if not missing_data:
                print(f"Skipping {ticker} - company information already exists")
                continue
            
            tickers_to_process.append(ticker)
            ticker_indices[ticker] = index
        
        if not tickers_to_process:
            print("All tickers already have complete company information!")
            logger.info("All tickers already have complete company information!")
            return
        
        print(f"Found {len(tickers_to_process)} tickers that need descriptions")
        
        # Process tickers in batches
        total_batches = (len(tickers_to_process) + batch_size - 1) // batch_size
        
        for batch_num in range(total_batches):
            start_idx = batch_num * batch_size
            end_idx = min(start_idx + batch_size, len(tickers_to_process))
            batch_tickers = tickers_to_process[start_idx:end_idx]
            
            print(f"\n--- Processing Batch {batch_num + 1}/{total_batches} ---")
            print(f"Tickers in this batch: {', '.join(batch_tickers)}")
            
            # Get descriptions for the batch
            batch_results = get_company_descriptions_batch(batch_tickers)
            
            # Update dataframe with results
            for ticker, company_info in batch_results.items():
                if ticker in ticker_indices:
                    row_idx = ticker_indices[ticker]
                    for field, value in company_info.items():
                        df.at[row_idx, field] = value
            
            # Save progress after each batch
            if output_file_path is None:
                output_file_path = input_file_path
            
            df.to_csv(output_file_path, index=False)
            print(f"✓ Batch {batch_num + 1} completed and saved")
            
            # Add delay between batches (except for the last batch)
            if batch_num < total_batches - 1:
                print(f"Waiting {delay} seconds before next batch...")
                time.sleep(delay)
        
        print(f"\n✓ Successfully saved all results to {output_file_path}")
        logger.info(f"Successfully saved results to {output_file_path}")
        
        # Print summary
        successful_long_descriptions = df[
            ~df['longBusinessSummary'].str.contains('Error:|No |Not available', case=False, na=False)
        ].shape[0]
        successful_short_descriptions = df[
            ~df['shortDescription'].str.contains('Error:|No |Not available|Limited information', case=False, na=False)
        ].shape[0]
        successful_industry = df[
            ~df['industry'].str.contains('Error:|No |Not available', case=False, na=False)
        ].shape[0]
        total_processed = len(tickers_to_process)
        
        print(f"\n=== SUMMARY ===")
        print(f"Total tickers processed: {total_processed}")
        print(f"Successful long descriptions: {successful_long_descriptions}")
        print(f"Successful short descriptions: {successful_short_descriptions}")
        print(f"Successful industry data: {successful_industry}")
        print(f"Failed/Missing long descriptions: {total_processed - successful_long_descriptions}")
        
        logger.info(f"Summary: Long descriptions: {successful_long_descriptions}/{total_processed}, Short descriptions: {successful_short_descriptions}/{total_processed}, Industry data: {successful_industry}/{total_processed}")
        
    except Exception as e:
        error_msg = f"Error processing CSV file: {str(e)}"
        print(f"ERROR: {error_msg}")
        logger.error(error_msg)
        raise

def main():
    """Main function to run the script."""
    # Define file paths
    script_dir = Path(__file__).parent
    input_file = script_dir / "Description YFinance.csv"
    
    # Check if input file exists
    if not input_file.exists():
        error_msg = f"Input file not found: {input_file}"
        print(f"ERROR: {error_msg}")
        logger.error(error_msg)
        return
    
    print(f"Starting description fetch for file: {input_file}")
    logger.info(f"Starting description fetch for file: {input_file}")
    
    # Process the CSV file with batching
    process_tickers_csv(
        input_file_path=str(input_file),
        batch_size=30,  # 30 tickers per batch
        delay=3  # 3 second delay between batches
    )
    
    print("Description fetch completed!")
    logger.info("Description fetch completed!")

if __name__ == "__main__":
    main()
