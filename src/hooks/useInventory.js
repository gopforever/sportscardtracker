import { useState, useCallback, useEffect } from 'react';
import { 
  getInventory, 
  addInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem 
} from '../utils/api.js';
import { INVENTORY_STATUS } from '../utils/constants.js';

export const useInventory = (initialStatus = INVENTORY_STATUS.ALL) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(initialStatus);

  const fetchInventory = useCallback(async (filterStatus = status) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getInventory(filterStatus);
      setItems(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  const addItem = useCallback(async (item) => {
    setLoading(true);
    setError(null);
    
    try {
      const newItem = await addInventoryItem(item);
      setItems(prev => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      setError(err.message || 'Failed to add item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedItem = await updateInventoryItem(id, updates);
      setItems(prev => 
        prev.map(item => item.id === id ? updatedItem : item)
      );
      return updatedItem;
    } catch (err) {
      setError(err.message || 'Failed to update item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await deleteInventoryItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    items,
    loading,
    error,
    status,
    setStatus,
    fetchInventory,
    addItem,
    updateItem,
    deleteItem
  };
};

export default useInventory;
