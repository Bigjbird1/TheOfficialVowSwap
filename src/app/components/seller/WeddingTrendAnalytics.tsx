import { LineChart } from '../charts';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useState } from 'react';

interface TrendData {
  month: string;
  demand: number;
}

export const WeddingTrendAnalytics = () => {
  const { getSeasonalTrends } = useAnalytics();
  const [timeRange, setTimeRange] = useState('12M');
  const [category, setCategory] = useState('all');
  
  const { data, loading, error } = getSeasonalTrends({
    timeRange,
    category
  });


  const chartData = data?.map((d: TrendData) => ({
    date: d.month,
    demand: d.demand
  })) || [];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Wedding Trend Analytics</h2>
        <div className="flex gap-4">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="3M">Last 3 Months</option>
            <option value="6M">Last 6 Months</option>
            <option value="12M">Last 12 Months</option>
          </select>
          <select
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All Categories</option>
            <option value="dresses">Dresses</option>
            <option value="venues">Venues</option>
            <option value="catering">Catering</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error loading data</div>
      ) : (
        <LineChart 
          data={chartData}
          lines={[
            {
              key: 'demand',
              name: 'Demand',
              color: '#6366f1'
            }
          ]}
          title="Wedding Demand Trends"
          xAxisKey="date"
        />
      )}
    </div>
  );
};
