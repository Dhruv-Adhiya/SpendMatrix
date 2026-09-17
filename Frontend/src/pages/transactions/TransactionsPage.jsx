import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { GlassButton } from '../../components/ui/GlassButton';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { TransactionTable } from '../../components/transactions/TransactionTable';
import { TransactionFilters } from '../../components/transactions/TransactionFilters';
import { TransactionFormModal } from '../../components/transactions/TransactionFormModal';
import './TransactionsPage.css';

export function TransactionsPage() {
  // Data state
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state (Cursor for default, Offset for search)
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [searchPage, setSearchPage] = useState(1);

  // Filters state
  const defaultFilters = {
    search: '',
    type: '',
    category_id: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
  };
  const [filters, setFilters] = useState(defaultFilters);
  const [debouncedFilters, setDebouncedFilters] = useState(defaultFilters);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Categories once for the filters and form
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Debounce filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [filters]);

  const isSearchActive = () => {
    const { search, type, category_id, minAmount, maxAmount, startDate, endDate } = debouncedFilters;
    return search || type || category_id || minAmount || maxAmount || startDate || endDate;
  };

  const fetchTransactions = useCallback(async (isLoadMore = false) => {
    if (!isLoadMore) setIsLoading(true);
    setError(null);
    try {
      let response;
      if (isSearchActive()) {
        // Use offset pagination for search
        const page = isLoadMore ? searchPage + 1 : 1;
        response = await api.get('/transactions/search', {
          params: {
            ...debouncedFilters,
            page,
            limit: 20
          }
        });
        const newTransactions = response.data.data || [];
        setTransactions(prev => isLoadMore ? [...prev, ...newTransactions] : newTransactions);
        setHasMore(response.data.pagination?.hasMore || false);
        setSearchPage(page);
      } else {
        // Use cursor pagination for default view
        const params = { limit: 20 };
        if (isLoadMore && nextCursor) {
          params.cursor_date = nextCursor.cursor_date;
          params.cursor_id = nextCursor.cursor_id;
        }
        response = await api.get('/transactions', { params });
        const newTransactions = response.data.data?.transactions || [];
        setTransactions(prev => isLoadMore ? [...prev, ...newTransactions] : newTransactions);
        setNextCursor(response.data.data?.nextCursor || null);
        setHasMore(response.data.data?.hasMore || false);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Could not load transactions.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedFilters, nextCursor, searchPage]);

  // Fetch when filters (debounced) change
  useEffect(() => {
    fetchTransactions(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters]);

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setSearchPage(1);
    setNextCursor(null);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchTransactions(true);
    }
  };

  // Form Handlers
  const handleOpenCreate = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (tx) => {
    setEditingTransaction(tx);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (tx) => {
    setTransactionToDelete(tx);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction.id}`, formData);
        toast.success('Transaction updated successfully');
      } else {
        await api.post('/transactions', formData);
        toast.success('Transaction added successfully');
      }
      setIsFormOpen(false);
      // Refresh list to show new/updated data
      fetchTransactions(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!transactionToDelete) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/transactions/${transactionToDelete.id}`);
      toast.success('Transaction deleted');
      setIsDeleteDialogOpen(false);
      fetchTransactions(false);
    } catch (err) {
      toast.error('Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="transactions-page animate-fade-in">
      <div className="page-header-actions mb-4">
        <h2 className="section-title">Transactions</h2>
        <GlassButton variant="primary" icon="Plus" onClick={handleOpenCreate}>
          Add Transaction
        </GlassButton>
      </div>

      <TransactionFilters 
        filters={filters} 
        setFilters={setFilters} 
        categories={categories} 
        onReset={handleResetFilters}
      />

      {error ? (
        <ErrorState title="Error" message={error} onRetry={() => fetchTransactions(false)} />
      ) : isLoading && transactions.length === 0 ? (
        <div className="table-skeleton">
          <Skeleton height="50px" className="mb-2" />
          <Skeleton height="50px" className="mb-2" />
          <Skeleton height="50px" className="mb-2" />
          <Skeleton height="50px" className="mb-2" />
          <Skeleton height="50px" className="mb-2" />
        </div>
      ) : (
        <>
          <TransactionTable 
            transactions={transactions} 
            onEdit={handleOpenEdit} 
            onDelete={handleOpenDelete} 
            onAdd={handleOpenCreate}
          />
          
          {hasMore && (
            <div className="load-more-container">
              <GlassButton variant="secondary" onClick={handleLoadMore} isLoading={isLoading}>
                Load More
              </GlassButton>
            </div>
          )}
        </>
      )}

      <TransactionFormModal 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingTransaction}
        categories={categories}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Transaction"
        message={`Are you sure you want to delete this transaction for ${transactionToDelete ? new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(transactionToDelete.amount) : ''}? This action cannot be undone.`}
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
