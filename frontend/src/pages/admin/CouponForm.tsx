import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../api/client';
import { CreateCouponRequest, UpdateCouponRequest, AdminCoupon } from '../../types';
import Loading from '../../components/Loading';
import AppHeader from '../../components/AppHeader';

export default function CouponForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateCouponRequest>({
    name: '',
    description: '',
    currency: 'USD',
    costPrice: 0,
    marginPercentage: 0,
    couponValue: 0,
    stock: 0,
    isActive: true,
    category: '',
    tags: [],
  });

  useEffect(() => {
    if (isEdit) {
      loadCoupon();
    }
  }, [id]);

  const loadCoupon = async () => {
    try {
      const { data } = await apiClient.get<{ success: true; data: AdminCoupon }>(`/admin/coupons/${id}`);
      const coupon = data.data;
      setFormData({
        name: coupon.name,
        description: coupon.description || '',
        currency: coupon.currency,
        costPrice: parseFloat(coupon.costPrice),
        marginPercentage: parseFloat(coupon.marginPercentage),
        couponValue: coupon.coupon ? parseFloat(coupon.coupon.value) : 0,
        couponCode: coupon.coupon?.code || '',
        stock: coupon.stock,
        isActive: coupon.isActive,
        category: coupon.category || '',
        tags: coupon.tags,
        sku: coupon.sku || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (isEdit) {
        await apiClient.put<{ success: true; data: AdminCoupon }>(`/admin/coupons/${id}`, formData);
      } else {
        await apiClient.post<{ success: true; data: AdminCoupon }>('/admin/coupons', formData);
      }
      navigate('/admin/coupons');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="app-shell">
      <div className="container" style={{ maxWidth: '700px' }}>
        <AppHeader title={isEdit ? 'Edit Coupon' : 'Create Coupon'} subtitle={isEdit ? 'Update coupon details' : 'Add a new coupon product'} isAdmin />
        <Loading />
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <div className="container" style={{ maxWidth: '700px' }}>
        <AppHeader title={isEdit ? 'Edit Coupon' : 'Create Coupon'} subtitle={isEdit ? 'Update coupon details' : 'Add a new coupon product'} isAdmin />
        {error ? <div className="alert alert-error">{error}</div> : null}

        <section className="panel">
          <h2>{isEdit ? 'Edit Coupon' : 'Create Coupon'}</h2>

          <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="label">SKU (optional)</label>
          <input
            type="text"
            className="input"
            value={formData.sku || ''}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value || null })}
            placeholder="AMZ-GC-USD-050"
          />
        </div>

        <div className="form-row">
          <label className="label">
            Name <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            type="text"
            className="input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-row">
          <label className="label">Description</label>
          <textarea
            className="textarea"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
            rows={3}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="form-row">
            <label className="label">
              Cost Price <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="number"
              className="input"
              step="0.01"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
              required
              min="0"
            />
          </div>

          <div className="form-row">
            <label className="label">
              Margin % <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="number"
              className="input"
              step="0.01"
              value={formData.marginPercentage}
              onChange={(e) => setFormData({ ...formData, marginPercentage: parseFloat(e.target.value) || 0 })}
              required
              min="0"
              max="1000"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="form-row">
            <label className="label">
              Coupon Value <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="number"
              className="input"
              step="0.01"
              value={formData.couponValue}
              onChange={(e) => setFormData({ ...formData, couponValue: parseFloat(e.target.value) || 0 })}
              required
              min="0"
            />
          </div>

          <div className="form-row">
            <label className="label">Stock</label>
            <input
              type="number"
              className="input"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>
        </div>

        <div className="form-row">
          <label className="label">Category</label>
          <input
            type="text"
            className="input"
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value || null })}
          />
        </div>

        <div className="form-row">
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            Active
          </label>
        </div>

        <div className="inline-actions" style={{ justifyContent: 'flex-end', marginTop: '8px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-secondary" type="button" onClick={() => navigate('/admin/coupons')}>
            Cancel
          </button>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : (isEdit ? 'Update' : 'Create coupon')}
          </button>
        </div>
      </form>
        </section>
      </div>
    </div>
  );
}
