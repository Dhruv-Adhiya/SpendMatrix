import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { GlassButton } from '../../components/ui/GlassButton';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PeriodSelector } from '../../components/budgets/PeriodSelector';
import { BudgetSummary } from '../../components/budgets/BudgetSummary';
import { BudgetCard } from '../../components/budgets/BudgetCard';
import { BudgetFormModal } from '../../components/budgets/BudgetFormModal';
import './BudgetsPage.css';

export function BudgetsPage() {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBudgetData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [budgetsRes, summaryRes] = await Promise.all([
        api.get(`/budgets?month=${month}&year=${year}`),
        api.get(`/budgets/summary?month=${month}&year=${year}`)
      ]);
      setBudgets(budgetsRes.data.data || []);
      setSummary(summaryRes.data.data || null);
    } catch (err) {
      console.error('Failed to fetch budget data:', err);
      setError('Could not load budget data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData]);

  const handleOpenCreate = () => {
    setEditingBudget(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (budget) => {
    setBudgetToDelete(budget);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await api.post('/budgets', formData);
      toast.success('Budget saved successfully');
      setIsFormOpen(false);
      fetchBudgetData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!budgetToDelete) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/budgets/${budgetToDelete.id}`);
      toast.success('Budget deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchBudgetData();
    } catch (err) {
      toast.error('Failed to delete budget');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="budgets-content animate-fade-in">
          <Skeleton height="150px" borderRadius="16px" className="mb-4" />
          <div className="budgets-grid">
            <Skeleton height="180px" borderRadius="16px" />
            <Skeleton height="180px" borderRadius="16px" />
            <Skeleton height="180px" borderRadius="16px" />
          </div>
        </div>
      );
    }

    if (error) {
      return <ErrorState title="Error Loading Budgets" message={error} onRetry={fetchBudgetData} />;
    }

    if (budgets.length === 0) {
      return (
        <div className="budgets-content animate-fade-in">
          {summary && (
            <div className="mb-6">
              <BudgetSummary 
                totalBudget={0}
                totalSpent={summary.total_spent || 0}
                remaining={0 - (summary.total_spent || 0)}
              />
            </div>
          )}
          <EmptyState
            icon="PieChart"
            title="No Budgets Set"
            description={`You haven't set any category budgets for ${new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}.`}
            actionLabel="Create a Budget"
            onAction={handleOpenCreate}
          />
        </div>
      );
    }

    return (
      <div className="budgets-content animate-fade-in">
        {summary && (
          <div className="mb-6">
            <BudgetSummary 
              totalBudget={summary.total_budget || 0}
              totalSpent={summary.total_spent || 0}
              remaining={summary.remaining || 0}
            />
          </div>
        )}

        <h3 className="section-subtitle mb-4">Category Budgets</h3>
        <div className="budgets-grid">
          {budgets.map((budget) => (
            <BudgetCard 
              key={budget.id} 
              budget={budget} 
              onEdit={handleOpenEdit} 
              onDelete={handleOpenDelete} 
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="budgets-page animate-fade-in">
      <div className="page-header-actions mb-4">
        <h2 className="section-title">Budgets</h2>
        <GlassButton variant="primary" icon="Plus" onClick={handleOpenCreate}>
          Add Budget
        </GlassButton>
      </div>

      <div className="period-selector-container mb-6">
        <PeriodSelector 
          month={month}
          year={year}
          onMonthChange={setMonth}
          onYearChange={setYear}
        />
      </div>

      {renderContent()}

      <BudgetFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingBudget}
        currentMonth={month}
        currentYear={year}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Budget"
        message={`Are you sure you want to delete the budget for ${budgetToDelete?.category_name}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        isConfirming={isDeleting}
        variant="danger"
      />
    </div>
  );
}
