import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../api/client';
import { AdminCoupon, CouponStats } from '../../types';
import Loading from '../../components/Loading';
import AppHeader from '../../components/AppHeader';

export default function CouponDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [coupon, setCoupon] = useState<AdminCoupon | null>(null);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadCoupon();
      loadStats();
    }
  }, [id]);

  const loadCoupon = async () => {
    try {
      const { data } = await apiClient.get<{ success: true; data: AdminCoupon }>(`/admin/coupons/${id}`);
      setCoupon(data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load coupon');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await apiClient.get<{ success: true; data: CouponStats }>(`/admin/coupons/${id}/stats`);
      setStats(data.data);
    } catch (err: any) {
      // Stats might fail if no purchases, ignore
    }
  };

  if (loading) return (
    <div className="app-shell">
      <div className="container" style={{ maxWidth: '900px' }}>
        <AppHeader title="Coupon Details" subtitle="Loading..." isAdmin />
        <Loading />
      </div>
    </div>
  );
  if (error) return (
    <div className="app-shell">
      <div className="container" style={{ maxWidth: '900px' }}>
        <AppHeader title="Coupon Details" isAdmin />
        <div className="alert alert-error">{error}</div>
      </div>
    </div>
  );
  if (!coupon) return (
    <div className="app-shell">
      <div className="container" style={{ maxWidth: '900px' }}>
        <AppHeader title="Coupon Details" isAdmin />
        <div className="empty-state">Coupon not found</div>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <div className="container" style={{ maxWidth: '900px' }}>
        <AppHeader title={coupon.name} subtitle="Coupon product details" isAdmin />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div className="inline-actions">
            <button className="btn btn-secondary" onClick={() => navigate(`/admin/coupons/${id}/edit`)}>
              Edit
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/admin/coupons')}>
              ← Back
            </button>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '24px' }}>
          <div className="panel">
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Product Info</h3>
            <p style={{ margin: '10px 0', color: 'var(--text-soft)', fontSize: '14px' }}>
              <strong>SKU:</strong> {coupon.sku || '-'}
            </p>
            <p style={{ margin: '10px 0', color: 'var(--text-soft)', fontSize: '14px' }}>
              <strong>Description:</strong> {coupon.description || '-'}
            </p>
            <p style={{ margin: '10px 0', color: 'var(--text-soft)', fontSize: '14px' }}>
              <strong>Category:</strong> {coupon.category || '-'}
            </p>
            <p style={{ margin: '10px 0', color: 'var(--text-soft)', fontSize: '14px' }}>
              <strong>Status:</strong> {coupon.isActive ? '✅ Active' : '❌ Inactive'}
            </p>
          </div>

          <div className="panel">
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Pricing</h3>
            <p style={{ margin: '10px 0', color: 'var(--text-soft)', fontSize: '14px' }}>
              <strong>Cost Price:</strong> ${coupon.costPrice} {coupon.currency}
            </p>
            <p style={{ margin: '10px 0', color: 'var(--text-soft)', fontSize: '14px' }}>
              <strong>Margin:</strong> {coupon.marginPercentage}%
            </p>
            <p style={{ margin: '10px 0', color: 'var(--text-soft)', fontSize: '14px' }}>
              <strong>Minimum Sell Price:</strong> ${coupon.minimumSellPrice} {coupon.currency}
            </p>
            <p style={{ margin: '10px 0', color: 'var(--text-soft)', fontSize: '14px' }}>
              <strong>Coupon Value:</strong> ${coupon.coupon?.value || '-'} {coupon.currency}
            </p>
          </div>
        </div>

        <div className="panel section-gap">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Inventory</h3>
          <p style={{ margin: '10px 0', color: 'var(--text-soft)', fontSize: '14px' }}>
            <strong>Stock:</strong> {coupon.stock}
          </p>
          <p style={{ margin: '10px 0', color: 'var(--text-soft)', fontSize: '14px' }}>
            <strong>Reserved:</strong> {coupon.reservedStock}
          </p>
          <p style={{ margin: '10px 0', color: 'var(--text-soft)', fontSize: '14px' }}>
            <strong>Available:</strong> {coupon.stock - coupon.reservedStock}
          </p>
        </div>

        {stats && (
          <div className="panel section-gap">
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Purchase Statistics</h3>
            <p style={{ margin: '10px 0', color: 'var(--text-soft)', fontSize: '14px' }}>
              <strong>Total Purchases:</strong> {stats.purchaseCount}
            </p>
            <p style={{ margin: '10px 0', color: 'var(--text-soft)', fontSize: '14px' }}>
              <strong>Total Revenue:</strong> ${stats.totalRevenue} {coupon.currency}
            </p>
          </div>
        )}

        {coupon.tags.length > 0 && (
          <div className="panel section-gap">
            <strong style={{ fontSize: '14px' }}>Tags:</strong>{' '}
            {coupon.tags.map((tag, i) => (
              <span key={i} className="badge" style={{ marginLeft: '8px' }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
