import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../api/admin";
import AppHeader from "../../components/AppHeader";

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await adminLogin({ username, password });
      localStorage.setItem("adminToken", response.token);

      navigate("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="container">
        <AppHeader
          title="Admin Login"
          subtitle="Access the coupon management dashboard."
        />

        <section className="panel" style={{ maxWidth: 520 }}>
          {error ? <div className="alert alert-error">{error}</div> : null}

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-row">
              <label className="label">Username</label>
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
              />
            </div>

            <div className="form-row">
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="inline-actions">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
