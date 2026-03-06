import { useNavigate } from 'react-router-dom';
import AppHeader from '../../components/AppHeader';

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <div className="container">
        <AppHeader title="Admin Dashboard" subtitle="Manage your coupon marketplace" isAdmin />

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <div
            className="card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/admin/coupons')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 16px 36px rgba(86, 66, 43, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow)';
            }}
          >
            <div className="card-body">
              <h2 style={{ margin: '0 0 12px 0', fontSize: '22px', fontWeight: '600' }}>📦 Coupon Products</h2>
              <p style={{ margin: 0, color: 'var(--text-soft)', fontSize: '14px', lineHeight: '1.5' }}>Manage coupon products (CRUD)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
