import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, Title } from "@tremor/react";

interface DataPoint {
  [key: string]: string | number;
}

interface BarChartProps {
  data: DataPoint[];
  bars: {
    key: string;
    name: string;
    color: string;
  }[];
  title: string;
  xAxisKey: string;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  bars,
  title,
  xAxisKey,
  height = 400,
}) => {
  return (
    <Card>
      <Title>{title}</Title>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <RechartsBarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: 12 }}
              tickFormatter={(value: string) => {
                // Handle date formatting if the value is a date
                if (value.includes('-')) {
                  return value.split('-').slice(1).join('/');
                }
                return value;
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {bars.map((bar) => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                name={bar.name}
                fill={bar.color}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
