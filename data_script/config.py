from dataclasses import dataclass
from typing import List

@dataclass
class Config:
    """Configuration settings for the stock data processor."""
    EXCEL_FILE: str = 'data_script/10-companies.xlsx'    
    DETAILS_DIR: str = 'details'
    LOGS_DIR: str = 'logs'
    SUMMARY_FILE: str = 'companies.json'
    YEARS: List[str] = None
    BATCH_SIZE: int = 20
    API_DELAY: int = 3
    PRICE_UPDATE_DAYS: int = 1

    def __post_init__(self):
        if self.YEARS is None:
            self.YEARS = ['2023', '2024']
