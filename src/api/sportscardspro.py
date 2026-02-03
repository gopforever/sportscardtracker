"""
SportsCardsPro API Client

This module provides a client for interacting with the SportsCardsPro API.
"""

import time
from typing import Dict, List, Optional, Any
import requests


class SportsCardsProAPI:
    """Client for interacting with the SportsCardsPro API."""

    def __init__(self, api_token: str, base_url: str = "https://www.sportscardspro.com"):
        """
        Initialize the API client.

        Args:
            api_token: Authentication token for the API
            base_url: Base URL for the API (default: https://www.sportscardspro.com)
        """
        self.api_token = api_token
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.max_retries = 3
        self.retry_delay = 1  # seconds

    def _make_request(
        self, 
        endpoint: str, 
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make an authenticated request to the API with retry logic.

        Args:
            endpoint: API endpoint path
            params: Query parameters

        Returns:
            Parsed JSON response

        Raises:
            APIError: If the API returns an error or request fails
        """
        if params is None:
            params = {}
        
        # Add authentication token
        params['t'] = self.api_token
        
        url = f"{self.base_url}{endpoint}"
        
        for attempt in range(self.max_retries):
            try:
                response = self.session.get(url, params=params, timeout=10)
                response.raise_for_status()
                
                data = response.json()
                
                # Check for API error status
                if isinstance(data, dict):
                    if data.get('status') == 'error':
                        error_msg = data.get('error-message', 'Unknown API error')
                        raise APIError(f"API Error: {error_msg}")
                    
                    if data.get('status') == 'success':
                        return data
                
                # If no status field, return the data as is
                return data
                
            except requests.exceptions.RequestException as e:
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay * (attempt + 1))
                    continue
                raise APIError(f"Request failed after {self.max_retries} attempts: {str(e)}")
        
        raise APIError("Max retries exceeded")

    def get_product(
        self, 
        product_id: Optional[int] = None, 
        search_query: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get single card data by ID or search query.

        Args:
            product_id: Product ID to fetch
            search_query: Search query string

        Returns:
            Product data dictionary

        Raises:
            ValueError: If neither product_id nor search_query is provided
            APIError: If the API request fails
        """
        if product_id is None and search_query is None:
            raise ValueError("Either product_id or search_query must be provided")
        
        params = {}
        if product_id is not None:
            params['id'] = product_id
        if search_query is not None:
            params['search'] = search_query
        
        return self._make_request('/api/product', params)

    def get_products(self, search_query: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get multiple cards matching a search query.

        Args:
            search_query: Search query string
            limit: Maximum number of results (default: 50)

        Returns:
            List of product data dictionaries

        Raises:
            APIError: If the API request fails
        """
        params = {
            'search': search_query,
            'limit': limit
        }
        
        response = self._make_request('/api/products', params)
        
        # Extract products list from response
        if isinstance(response, dict) and 'products' in response:
            return response['products']
        elif isinstance(response, list):
            return response
        
        return []

    def parse_product_data(self, product: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse and normalize product data from API response.

        Args:
            product: Raw product data from API

        Returns:
            Normalized product data with standardized field names
        """
        return {
            'id': product.get('id'),
            'product_name': product.get('product-name', ''),
            'console_name': product.get('console-name', ''),
            'genre': product.get('genre', ''),
            'release_date': product.get('release-date', ''),
            'loose_price': self._parse_price(product.get('loose-price')),
            'psa_10_price': self._parse_price(product.get('manual-only-price')),
            'grade_9_price': self._parse_price(product.get('graded-price')),
            'grade_8_price': self._parse_price(product.get('new-price')),
            'grade_7_price': self._parse_price(product.get('cib-price')),
            'bgs_10_price': self._parse_price(product.get('bgs-10-price')),
            'cgc_10_price': self._parse_price(product.get('condition-17-price')),
            'sgc_10_price': self._parse_price(product.get('condition-18-price')),
            'sales_volume': product.get('sales-volume', 0)
        }

    @staticmethod
    def _parse_price(price_value: Any) -> int:
        """
        Parse price value to cents (integer).

        Args:
            price_value: Price value from API (can be string, int, float, or None)

        Returns:
            Price in cents as integer, or 0 if invalid
        """
        if price_value is None or price_value == '':
            return 0
        
        try:
            # If already in cents (integer)
            if isinstance(price_value, int):
                return price_value
            
            # If float or string, convert to cents
            price_float = float(price_value)
            return int(price_float * 100) if price_float < 1000 else int(price_float)
        except (ValueError, TypeError):
            return 0


class APIError(Exception):
    """Exception raised for API errors."""
    pass
