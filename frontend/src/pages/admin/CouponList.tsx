import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { AdminCoupon } from '../../types';
import Loading from '../../components/Loading';
import AppHeader from '../../components/AppHeader';

export default function CouponList() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const { data } = await apiClient.get<{ success: true; data: AdminCoupon[] }>('/admin/coupons');
      setCoupons(data.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to load coupons');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await apiClient.delete(`/admin/coupons/${id}`);
      await loadCoupons();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  if (loading) return (
    <div className="app-shell">
      <div className="container">
        <AppHeader title="Coupon Products" subtitle="Manage your coupon inventory" isAdmin />
        <Loading />
      </div>
    </div>
  );
  if (error) return (
    <div className="app-shell">
      <div className="container">
        <AppHeader title="Coupon Products" subtitle="Manage your coupon inventory" isAdmin />
        <div className="alert alert-error">{error}</div>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <div className="container">
        <AppHeader title="Coupon Products" subtitle="Manage your coupon inventory" isAdmin />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div className="inline-actions">
            <button className="btn btn-primary" onClick={() => navigate('/admin/coupons/new')}>+ Create Coupon</button>
            <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
              ← Back
            </button>
          </div>
        </div>

        {coupons.length === 0 ? (
          <div className="empty-state panel">
            <p>No coupons found.</p>
            <button className="btn btn-primary" onClick={() => navigate('/admin/coupons/new')} style={{ marginTop: '20px' }}>
              Create Your First Coupon
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td>{coupon.sku || '-'}</td>
                    <td style={{ fontWeight: '500' }}>{coupon.name}</td>
                    <td style={{ fontWeight: '600' }}>
                      ${coupon.minimumSellPrice} {coupon.currency}
                    </td>
                    <td>{coupon.stock}</td>
                    <td>{coupon.isActive ? '✅ Active' : '❌ Inactive'}</td>
                    <td>
                      <div className="inline-actions">
                        <button
                          className="btn btn-secondary"
                          onClick={() => navigate(`/admin/coupons/${coupon.id}`)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => navigate(`/admin/coupons/${coupon.id}/edit`)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(coupon.id)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
