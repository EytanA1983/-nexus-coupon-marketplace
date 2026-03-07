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
                Secure digital coupon marketplace
              </p>
            </div>
          </div>

          <div className="nav-actions">
            {isAdmin ? (
              <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                Logout
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
