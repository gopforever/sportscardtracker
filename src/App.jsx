import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './components/Dashboard.jsx';
import CardSearch from './components/CardSearch.jsx';
import DealFinder from './components/DealFinder.jsx';
import InventoryManager from './components/InventoryManager.jsx';
import ProfitCalculator from './components/ProfitCalculator.jsx';
import SalesTracker from './components/SalesTracker.jsx';
import Reports from './components/Reports.jsx';
import { ROUTES } from './utils/constants.js';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.SEARCH} element={<CardSearch />} />
          <Route path={ROUTES.DEALS} element={<DealFinder />} />
          <Route path={ROUTES.INVENTORY} element={<InventoryManager />} />
          <Route path={ROUTES.CALCULATOR} element={<ProfitCalculator />} />
          <Route path={ROUTES.SALES} element={<SalesTracker />} />
          <Route path={ROUTES.REPORTS} element={<Reports />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
