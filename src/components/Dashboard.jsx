import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getInventory, getReport } from '../utils/api.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { ROUTES, MONTHLY_GOAL_CENTS } from '../utils/constants.js';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalValue: 0,
    availableItems: 0,
    soldItems: 0,
    monthlyProfit: 0
  });
  const [recentItems, setRecentItems] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [inventory, report] = await Promise.all([
          getInventory('all'),
          getReport()
        ]);

        const availableItems = inventory.filter(item => item.status === 'available');
        const soldItems = inventory.filter(item => item.status === 'sold');
        const totalValue = availableItems.reduce((sum, item) => sum + (item.purchase_price || 0), 0);

        setStats({
          totalValue,
          availableItems: availableItems.length,
          soldItems: soldItems.length,
          monthlyProfit: report?.total_profit || 0
        });

        setRecentItems(inventory.slice(0, 5));
        setReportData(report);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Inventory Value',
      value: formatCurrency(stats.totalValue),
      icon: '💰',
      color: 'bg-blue-500',
      link: ROUTES.INVENTORY
    },
    {
      title: 'Available Items',
      value: stats.availableItems,
      icon: '📦',
      color: 'bg-green-500',
      link: ROUTES.INVENTORY
    },
    {
      title: 'Sold This Month',
      value: stats.soldItems,
      icon: '✅',
      color: 'bg-purple-500',
      link: ROUTES.SALES
    },
    {
      title: 'Monthly Profit',
      value: formatCurrency(stats.monthlyProfit),
      icon: '📈',
      color: 'bg-orange-500',
      link: ROUTES.REPORTS
    }
  ];

  const progressPercent = (stats.monthlyProfit / MONTHLY_GOAL_CENTS) * 100;

  const pieData = [
    { name: 'Available', value: stats.availableItems },
    { name: 'Sold', value: stats.soldItems }
  ];

  const COLORS = ['#3b82f6', '#10b981'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's your overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            to={stat.link}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} text-white rounded-full p-3 text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Monthly Goal Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Goal Progress</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress: {formatCurrency(stats.monthlyProfit)}</span>
            <span>Goal: {formatCurrency(MONTHLY_GOAL_CENTS)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 text-right">
            {progressPercent.toFixed(1)}% Complete
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Sales */}
        {reportData && reportData.daily_sales && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={reportData.daily_sales.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="profit" fill="#10b981" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Items */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Items</h2>
          <Link to={ROUTES.INVENTORY} className="text-sm text-blue-600 hover:text-blue-700">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Card</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentItems.length > 0 ? (
                recentItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.card_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(item.purchase_price)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'sold' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(item.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No items yet. <Link to={ROUTES.INVENTORY} className="text-blue-600 hover:text-blue-700">Add your first item</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to={ROUTES.SEARCH}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
        >
          <div className="text-4xl mb-2">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900">Search Cards</h3>
          <p className="text-sm text-gray-500 mt-1">Find cards and check prices</p>
        </Link>
        <Link
          to={ROUTES.DEALS}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
        >
          <div className="text-4xl mb-2">💎</div>
          <h3 className="text-lg font-semibold text-gray-900">Find Deals</h3>
          <p className="text-sm text-gray-500 mt-1">Discover profitable opportunities</p>
        </Link>
        <Link
          to={ROUTES.CALCULATOR}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
        >
          <div className="text-4xl mb-2">🧮</div>
          <h3 className="text-lg font-semibold text-gray-900">Calculate Profit</h3>
          <p className="text-sm text-gray-500 mt-1">Estimate your returns</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
