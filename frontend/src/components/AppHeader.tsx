import { useNavigate } from "react-router-dom";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  isAdmin?: boolean;
};

export default function AppHeader({
  title,
  subtitle,
  isAdmin = false,
}: AppHeaderProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-badge" />
            <div>
              <p className="brand-title">Nexus Coupon Marketplace</p>
              <p className="brand-subtitle">
                Minimal digital marketplace with secure purchase flows
              </p>
            </div>
          </div>

          <div className="nav-actions">
            {isAdmin ? (
              <button 
                type="button" 
                className="btn btn-ghost" 
                onClick={handleLogout}
                style={{ 
                  minWidth: '100px',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  padding: '12px 20px',
                  border: '2px solid var(--primary)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: 'var(--primary)',
                  boxShadow: '0 2px 8px rgba(183, 134, 82, 0.2)'
                }}
              >
                🔓 Logout
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
    </>
  );
}
