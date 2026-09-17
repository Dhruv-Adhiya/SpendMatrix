import PropTypes from 'prop-types';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { GlassCard } from '../ui/GlassCard';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

// Predefined palette for categories
const CHART_COLORS = [
  'rgba(139, 92, 246, 0.8)', // Primary
  'rgba(59, 130, 246, 0.8)', // Blue
  'rgba(16, 185, 129, 0.8)', // Emerald
  'rgba(245, 158, 11, 0.8)', // Amber
  'rgba(244, 63, 94, 0.8)',  // Rose
  'rgba(14, 165, 233, 0.8)', // Sky
  'rgba(168, 85, 247, 0.8)', // Purple
  'rgba(236, 72, 153, 0.8)'  // Pink
];

export function CategoryDonutChart({ data }) {
  const { theme } = useTheme();
  
  const isDark = theme === 'dark';
  const textColor = isDark ? '#9ca3af' : '#4b5563';
  const borderColor = isDark ? '#1a1a2e' : '#ffffff';

  const labels = data?.map(d => d.category_name) || [];
  const totals = data?.map(d => d.total) || [];
  
  const backgroundColors = labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

  const chartData = {
    labels,
    datasets: [
      {
        data: totals,
        backgroundColor: backgroundColors,
        borderColor: borderColor,
        borderWidth: 2,
        hoverOffset: 4
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: textColor,
          usePointStyle: true,
          padding: 20,
          font: { size: 12 }
        },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(10, 10, 15, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? '#d1d5db' : '#374151',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) label += ': ';
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
            }
            // If API provides percentage, we could add it here
            const dataItem = data[context.dataIndex];
            if (dataItem && dataItem.percentage) {
              label += ` (${dataItem.percentage}%)`;
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <GlassCard padding="normal" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '16px', marginBottom: 'var(--spacing-4)', color: 'var(--color-text-primary)' }}>
        Expense Breakdown
      </h3>
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        {labels.length > 0 ? (
          <Doughnut data={chartData} options={options} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
            No category data available.
          </div>
        )}
      </div>
    </GlassCard>
  );
}

CategoryDonutChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    category_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    category_name: PropTypes.string.isRequired,
    total: PropTypes.number.isRequired,
    percentage: PropTypes.number, // Optional
  })),
};
