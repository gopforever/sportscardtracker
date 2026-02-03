import { useState, useCallback } from 'react';
import { recordSale } from '../utils/api.js';

export const useSales = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const addSale = useCallback(async (saleData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await recordSale(saleData);
      setSuccess(true);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to record sale');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSuccess = useCallback(() => {
    setSuccess(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    success,
    addSale,
    clearSuccess,
    clearError
  };
};

export default useSales;
