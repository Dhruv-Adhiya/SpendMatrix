import PropTypes from 'prop-types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { GlassCard } from '../ui/GlassCard';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function MonthlyTrendChart({ data }) {
  const { theme } = useTheme();
  
  const isDark = theme === 'dark';
  const textColor = isDark ? '#9ca3af' : '#4b5563';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  // Process data if available, or use empty placeholders
  const labels = data?.map(d => d.month) || [];
  const incomeData = data?.map(d => d.totalIncome) || [];
  const expenseData = data?.map(d => d.totalExpense) || [];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        backgroundColor: 'rgba(16, 185, 129, 0.8)', // accent-income
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      },
      {
        label: 'Expense',
        data: expenseData,
        backgroundColor: 'rgba(244, 63, 94, 0.8)', // accent-expense
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: textColor, usePointStyle: true, boxWidth: 8 },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDark ? 'rgba(10, 10, 15, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? '#d1d5db' : '#374151',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: textColor, font: { size: 12 } },
      },
      y: {
        grid: { color: gridColor, drawBorder: false },
        ticks: {
          color: textColor,
          font: { size: 12 },
          callback: function(value) {
            return '$' + value; // Simple formatting for axis
          }
        },
      },
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
  };

  return (
    <GlassCard padding="normal" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '16px', marginBottom: 'var(--spacing-4)', color: 'var(--color-text-primary)' }}>
        Monthly Trend
      </h3>
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        {labels.length > 0 ? (
          <Bar options={options} data={chartData} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
            No data available for this period.
          </div>
        )}
      </div>
    </GlassCard>
  );
}

MonthlyTrendChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    month: PropTypes.string.isRequired,
    totalIncome: PropTypes.number.isRequired,
    totalExpense: PropTypes.number.isRequired,
  })),
};
