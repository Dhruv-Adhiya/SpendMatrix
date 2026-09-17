import { useState, useEffect } from 'react';
import api from '../../services/api';
import { BalanceHero } from '../../components/dashboard/BalanceHero';
import { SummaryCards } from '../../components/dashboard/SummaryCards';
import { MonthlyTrendChart } from '../../components/dashboard/MonthlyTrendChart';
import { CategoryDonutChart } from '../../components/dashboard/CategoryDonutChart';
import { RecentTransactions } from '../../components/dashboard/RecentTransactions';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import './DashboardPage.css';

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/dashboard/summary');
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Could not load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard-skeleton">
        <Skeleton height="160px" borderRadius="16px" className="mb-4" />
        <div className="grid-3 mb-4">
          <Skeleton height="100px" borderRadius="16px" />
          <Skeleton height="100px" borderRadius="16px" />
          <Skeleton height="100px" borderRadius="16px" />
        </div>
        <div className="dashboard-grid">
          <div className="dashboard-main-col">
            <Skeleton height="350px" borderRadius="16px" className="mb-4" />
            <Skeleton height="400px" borderRadius="16px" />
          </div>
          <div className="dashboard-side-col">
            <Skeleton height="350px" borderRadius="16px" className="mb-4" />
            <Skeleton height="300px" borderRadius="16px" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Dashboard Error" 
        message={error} 
        onRetry={fetchDashboardData} 
      />
    );
  }

  return (
    <div className="dashboard-page animate-fade-in">
      <BalanceHero 
        balance={data?.balance || 0}
        income={data?.totalIncome || 0}
        expense={data?.totalExpense || 0}
      />
      
      <SummaryCards 
        income={data?.totalIncome || 0}
        expense={data?.totalExpense || 0}
        balance={data?.balance || 0}
      />

      <div className="dashboard-grid">
        <div className="dashboard-main-col">
          <div className="chart-container">
            <MonthlyTrendChart data={data?.monthlySummary} />
          </div>
          <div className="recent-tx-container">
            <RecentTransactions transactions={data?.recentTransactions} />
          </div>
        </div>
        
        <div className="dashboard-side-col">
          <div className="chart-container">
            <CategoryDonutChart data={data?.categoryBreakdown} />
          </div>
          <div className="actions-container">
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}
