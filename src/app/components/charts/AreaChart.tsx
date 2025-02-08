import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, Title } from "@tremor/react";

interface DataPoint {
  date: string;
  [key: string]: string | number;
}

interface AreaChartProps {
  data: DataPoint[];
  areas: {
    key: string;
    name: string;
    color: string;
    fillOpacity?: number;
  }[];
  title: string;
  xAxisKey?: string;
  height?: number;
  stackOffset?: 'none' | 'expand' | 'wiggle' | 'silhouette';
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  areas,
  title,
  xAxisKey = 'date',
  height = 400,
  stackOffset = 'none',
}) => {
  return (
    <Card>
      <Title>{title}</Title>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <RechartsAreaChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
            stackOffset={stackOffset}
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
            {areas.map((area) => (
              <Area
                key={area.key}
                type="monotone"
                dataKey={area.key}
                name={area.name}
                stroke={area.color}
                fill={area.color}
                fillOpacity={area.fillOpacity || 0.3}
                stackId={stackOffset !== 'none' ? 1 : undefined}
              />
            ))}
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
