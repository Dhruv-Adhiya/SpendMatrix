import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { IconButton } from '../../components/ui/IconButton';
import { Icon } from '../../components/ui/Icon';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { CategoryFormModal } from '../../components/categories/CategoryFormModal';
import './CategoriesPage.css';

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Could not load categories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', formData);
        toast.success('Category created successfully');
      }
      setIsFormOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/categories/${categoryToDelete.id}`);
      toast.success('Category deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchCategories();
    } catch (err) {
      // Show clear explanation if backend rejects deletion due to references
      if (err.response?.status === 400) {
        toast.error(err.response.data.message || 'Cannot delete category because it is in use.');
      } else {
        toast.error('Failed to delete category');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  if (isLoading) {
    return (
      <div className="categories-page animate-fade-in">
        <div className="page-actions mb-4">
          <Skeleton width="150px" height="40px" borderRadius="8px" />
        </div>
        <div className="categories-grid">
          <div>
            <Skeleton height="32px" width="120px" className="mb-4" />
            <Skeleton height="64px" borderRadius="12px" className="mb-2" />
            <Skeleton height="64px" borderRadius="12px" className="mb-2" />
          </div>
          <div>
            <Skeleton height="32px" width="120px" className="mb-4" />
            <Skeleton height="64px" borderRadius="12px" className="mb-2" />
            <Skeleton height="64px" borderRadius="12px" className="mb-2" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Error Loading Categories" message={error} onRetry={fetchCategories} />;
  }

  const renderCategoryList = (list, type) => {
    if (list.length === 0) {
      return (
        <EmptyState 
          icon="Tag" 
          title={`No ${type} categories`} 
          description={`You haven't added any ${type} categories yet.`}
          actionLabel="Add One"
          onAction={handleOpenCreate}
        />
      );
    }

    return (
      <div className="category-list">
        {list.map(category => (
          <GlassCard key={category.id} className="category-item" padding="small">
            <div className="category-item-left">
              <div className={`category-icon ${category.type}`}>
                <Icon name="Tag" size={18} />
              </div>
              <span className="category-name">{category.name}</span>
            </div>
            <div className="category-item-actions">
              <IconButton 
                icon="Edit2" 
                size={16} 
                variant="ghost" 
                onClick={() => handleOpenEdit(category)} 
                aria-label="Edit category"
              />
              <IconButton 
                icon="Trash2" 
                size={16} 
                variant="ghost" 
                onClick={() => handleOpenDelete(category)}
                aria-label="Delete category"
                className="danger-icon-btn"
              />
            </div>
          </GlassCard>
        ))}
      </div>
    );
  };

  return (
    <div className="categories-page animate-fade-in">
      <div className="page-header-actions mb-4">
        <h2 className="section-title">Manage Categories</h2>
        <GlassButton variant="primary" icon="Plus" onClick={handleOpenCreate}>
          New Category
        </GlassButton>
      </div>

      <div className="categories-grid">
        <div className="categories-column">
          <div className="column-header">
            <Icon name="TrendingDown" className="expense-icon" />
            <h3>Expense Categories</h3>
          </div>
          {renderCategoryList(expenseCategories, 'expense')}
        </div>

        <div className="categories-column">
          <div className="column-header">
            <Icon name="TrendingUp" className="income-icon" />
            <h3>Income Categories</h3>
          </div>
          {renderCategoryList(incomeCategories, 'income')}
        </div>
      </div>

      <CategoryFormModal 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingCategory}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? Transactions using this category will be affected.`}
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
