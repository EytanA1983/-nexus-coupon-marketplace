import { FormEvent, useEffect, useMemo, useState } from "react";
import AppHeader from "../../components/AppHeader";
import {
  AdminProduct,
  CreateCouponRequest,
  createAdminCoupon,
  deleteAdminCoupon,
  getAdminProducts,
  updateAdminCoupon,
} from "../../api/admin";

const initialForm: CreateCouponRequest = {
  name: "",
  description: "",
  image_url: "",
  cost_price: 0,
  margin_percentage: 0,
  value_type: "STRING",
  value: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<CreateCouponRequest>(initialForm);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const isEditing = useMemo(() => Boolean(editingProductId), [editingProductId]);

  async function loadProducts() {
    try {
      setLoadingProducts(true);
      setError("");

      const data = await getAdminProducts();
      setProducts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load products";
      console.error("Error loading products:", err);
      setError(errorMessage);
    } finally {
      setLoadingProducts(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const handleChange = <K extends keyof CreateCouponRequest>(
    key: K,
    value: CreateCouponRequest[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingProductId(null);
    setIsCreateOpen(false);
  };

  const handleEdit = (product: AdminProduct) => {
    setError("");
    setSuccess("");
    setEditingProductId(product.id);
    setIsCreateOpen(true);
    setForm({
      name: product.name,
      description: product.description,
      image_url: product.image_url,
      cost_price: Number(product.cost_price),
      margin_percentage: Number(product.margin_percentage),
      value_type: product.value_type,
      value: product.value,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (productId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this coupon?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(productId);
      setError("");
      setSuccess("");

      await deleteAdminCoupon(productId);

      if (editingProductId === productId) {
        resetForm();
      }

      setSuccess("Coupon deleted successfully.");
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete coupon");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const payload: CreateCouponRequest = {
        ...form,
        cost_price: Number(form.cost_price),
        margin_percentage: Number(form.margin_percentage),
      };

      if (editingProductId) {
        await updateAdminCoupon(editingProductId, payload);
        setSuccess("Coupon updated successfully.");
      } else {
        await createAdminCoupon(payload);
        setSuccess("Coupon created successfully.");
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save coupon");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="container">
        <AppHeader
          title="Admin Dashboard"
          subtitle="Create, update, and manage coupon products."
          isAdmin
        />

        {error ? <div className="alert alert-error">{error}</div> : null}
        {success ? <div className="alert alert-success">{success}</div> : null}

        <section className="panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              marginBottom: isCreateOpen ? 12 : 0,
              flexWrap: "wrap",
            }}
          >
            <h2 style={{ margin: 0 }}>
              {isEditing ? "Edit Coupon" : "Create Coupon"}
            </h2>

            {!isCreateOpen ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsCreateOpen(true)}
              >
                Create a new coupon
              </button>
            ) : (
              <button type="button" className="btn btn-ghost" onClick={resetForm}>
                {isEditing ? "Cancel Edit" : "Cancel"}
              </button>
            )}
          </div>

          {isCreateOpen ? (
            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="form-row">
                <label className="label">Name</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Amazon $100 Coupon"
                />
              </div>

              <div className="form-row">
                <label className="label">Description</label>
                <textarea
                  className="textarea"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Digital redeemable coupon"
                />
              </div>

              <div className="form-row">
                <label className="label">Image URL</label>
                <input
                  className="input"
                  value={form.image_url}
                  onChange={(e) => handleChange("image_url", e.target.value)}
                  placeholder="https://example.com/coupon-image.jpg"
                />
              </div>

              <div
                className="form-grid"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
              >
                <div className="form-row">
                  <label className="label">Cost Price</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.cost_price}
                    onChange={(e) => handleChange("cost_price", Number(e.target.value))}
                  />
                </div>

                <div className="form-row">
                  <label className="label">Margin Percentage</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.margin_percentage}
                    onChange={(e) =>
                      handleChange("margin_percentage", Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div
                className="form-grid"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
              >
                <div className="form-row">
                  <label className="label">Value Type</label>
                  <select
                    className="select"
                    value={form.value_type}
                    onChange={(e) =>
                      handleChange("value_type", e.target.value as "STRING" | "IMAGE")
                    }
                  >
                    <option value="STRING">STRING</option>
                    <option value="IMAGE">IMAGE</option>
                  </select>
                </div>

                <div className="form-row">
                  <label className="label">Coupon Value</label>
                  <input
                    className="input"
                    value={form.value}
                    onChange={(e) => handleChange("value", e.target.value)}
                    placeholder={
                      form.value_type === "STRING"
                        ? "ABCD-1234"
                        : "https://example.com/qr-image.png"
                    }
                  />
                </div>
              </div>

              {form.image_url ? (
                <div className="form-row">
                  <label className="label">Image Preview</label>
                  <div className="card" style={{ maxWidth: 320, padding: 12 }}>
                    <div className="product-image-wrap" style={{ aspectRatio: "16 / 10" }}>
                      <img
                        className="product-image"
                        src={form.image_url}
                        alt="Coupon preview"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="inline-actions">
                <button className="btn btn-primary" type="submit" disabled={submitting}>
                  {submitting
                    ? isEditing
                      ? "Updating..."
                      : "Creating..."
                    : isEditing
                    ? "Update coupon"
                    : "Create coupon"}
                </button>
              </div>
            </form>
          ) : (
            <p style={{ marginTop: 12, color: "var(--text-soft)" }}>
              Click "Create a new coupon" to open the form.
            </p>
          )}
        </section>

        <section className="panel section-gap">
          <h2 style={{ marginTop: 0 }}>Existing Coupons</h2>

          {loadingProducts ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <div className="empty-state">No coupons found yet.</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Cost</th>
                    <th>Margin %</th>
                    <th>Minimum Sell</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div
                          style={{
                            width: 72,
                            height: 48,
                            borderRadius: 10,
                            overflow: "hidden",
                            background: "#f3e7da",
                            border: "1px solid #e7d9c8",
                          }}
                        >
                          <img
                            src={product.image_url}
                            alt={product.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        </div>
                      </td>
                      <td>{product.name}</td>
                      <td>{product.value_type}</td>
                      <td>{product.cost_price}</td>
                      <td>{product.margin_percentage}</td>
                      <td>{product.minimum_sell_price}</td>
                      <td>
                        {product.is_sold ? (
                          <span className="badge">Sold</span>
                        ) : (
                          <span className="badge">Available</span>
                        )}
                      </td>
                      <td>
                        <div className="inline-actions">
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => handleEdit(product)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                          >
                            {deletingId === product.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
