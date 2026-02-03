import { useState, useCallback } from 'react';
import { searchCards, getCard } from '../utils/api.js';

export const useCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (query, limit = 50) => {
    if (!query || query.trim().length === 0) {
      setCards([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const results = await searchCards(query, limit);
      setCards(results);
    } catch (err) {
      setError(err.message || 'Failed to search cards');
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCard = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const card = await getCard(id);
      return card;
    } catch (err) {
      setError(err.message || 'Failed to fetch card');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCards = useCallback(() => {
    setCards([]);
    setError(null);
  }, []);

  return {
    cards,
    loading,
    error,
    search,
    fetchCard,
    clearCards
  };
};

export default useCards;
