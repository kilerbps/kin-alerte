import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

interface ReportData {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  commune_id: string;
  problem_type_id: string;
  created_at: string;
  commune?: {
    name: string;
  };
  problem_type?: {
    name: string;
  };
}

interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}

interface ReportsChartProps {
  reports: ReportData[];
  type?: 'bar' | 'pie' | 'line' | 'area';
  chartType?: 'by_status' | 'by_priority' | 'by_commune' | 'by_problem_type' | 'by_month';
  title?: string;
  height?: number;
}

const COLORS = {
  status: {
    pending: '#FFA500',
    'in-progress': '#1E90FF',
    resolved: '#32CD32',
    rejected: '#DC143C'
  },
  priority: {
    low: '#90EE90',
    medium: '#FFD700',
    high: '#FF6347',
    critical: '#8B0000'
  }
};

export const ReportsChart: React.FC<ReportsChartProps> = ({
  reports,
  type = 'bar',
  chartType = 'by_status',
  title = 'Statistiques des Signalements',
  height = 400
}) => {
  const processData = (): ChartDataPoint[] => {
    switch (chartType) {
      case 'by_status':
        const statusCount = reports.reduce((acc, report) => {
          const status = report.status;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return Object.entries(statusCount).map(([status, count]) => ({
          name: status === 'pending' ? 'En attente' :
                status === 'in-progress' ? 'En cours' :
                status === 'resolved' ? 'Résolu' : 'Rejeté',
          value: count,
          color: COLORS.status[status as keyof typeof COLORS.status]
        }));

      case 'by_priority':
        const priorityCount = reports.reduce((acc, report) => {
          const priority = report.priority;
          acc[priority] = (acc[priority] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return Object.entries(priorityCount).map(([priority, count]) => ({
          name: priority === 'low' ? 'Faible' :
                priority === 'medium' ? 'Moyenne' :
                priority === 'high' ? 'Élevée' : 'Critique',
          value: count,
          color: COLORS.priority[priority as keyof typeof COLORS.priority]
        }));

      case 'by_commune':
        const communeCount = reports.reduce((acc, report) => {
          const communeName = report.commune?.name || 'Inconnue';
          acc[communeName] = (acc[communeName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return Object.entries(communeCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([commune, count]) => ({
            name: commune,
            value: count,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`
          }));

      case 'by_problem_type':
        const problemTypeCount = reports.reduce((acc, report) => {
          const problemTypeName = report.problem_type?.name || 'Inconnu';
          acc[problemTypeName] = (acc[problemTypeName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return Object.entries(problemTypeCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 8)
          .map(([problemType, count]) => ({
            name: problemType,
            value: count,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`
          }));

      case 'by_month':
        const monthlyCount = reports.reduce((acc, report) => {
          const date = new Date(report.created_at);
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
          acc[monthYear] = (acc[monthYear] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return Object.entries(monthlyCount)
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([month, count]) => ({
            name: month,
            value: count,
            color: '#8884d8'
          }));

      default:
        return [];
    }
  };

  const data = processData();

  const renderChart = () => {
    switch (type) {
      case 'pie':
        return (
          <PieChart width={600} height={height}>
            <Pie
              data={data}
              cx={300}
              cy={height / 2}
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );

      case 'line':
        return (
          <LineChart width={600} height={height} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart width={600} height={height} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
          </AreaChart>
        );

      default: // bar
        return (
          <BarChart width={600} height={height} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        );
    }
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Aucune donnée disponible pour ce graphique</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}; 