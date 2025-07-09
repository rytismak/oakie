import os
import logging

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
