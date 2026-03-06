import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { PublicProduct, PurchaseResult } from '../../types';
import Loading from '../../components/Loading';
import AppHeader from '../../components/AppHeader';

type ProductWithSold = PublicProduct & { isSold?: boolean };

export default function ProductList() {
  const [products, setProducts] = useState<ProductWithSold[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data } = await apiClient.get<PublicProduct[]>('/customer/products');
      // Filter only available products (server already filters, but we ensure it)
      setProducts(data.map(p => ({ ...p, isSold: false })));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productId: string) => {
    try {
      setError('');
      setPurchaseResult(null);
      setLoadingId(productId);

      const { data } = await apiClient.post<PurchaseResult>(`/customer/products/${productId}/purchase`);

      setPurchaseResult(data);
      
      // Update the product locally to show "Sold" badge instead of reloading
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === productId ? { ...p, isSold: true } : p
        )
      );
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Purchase failed';
      setError(errorMsg);
    } finally {
      setLoadingId(null);
    }
  };

  if (loading) return (
    <div className="app-shell">
      <div className="container">
        <AppHeader title="Available Products" subtitle="Browse our collection of premium coupons" />
        <Loading message="Loading products..." />
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <div className="container">
        <AppHeader title="Available Products" subtitle="Browse our collection of premium coupons" />

        {error ? <div className="alert alert-error">{error}</div> : null}

        {purchaseResult ? (
          <div className="alert alert-success purchase-result">
            <strong>Purchase successful.</strong>
            <div>Final price: ${purchaseResult.final_price}</div>
            <div>Value type: {purchaseResult.value_type}</div>
            <div>Coupon value: {purchaseResult.value_type === 'STRING' ? purchaseResult.value : <img src={purchaseResult.value} alt="Coupon QR Code" style={{ maxWidth: '200px', display: 'block', marginTop: '8px', borderRadius: '8px' }} />}</div>
          </div>
        ) : null}

        {products.length === 0 ? (
          <div className="empty-state">
            <p>No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid products-grid">
            {products.map((product) => {
              const isSold = product.isSold === true;
              return (
                <article key={product.id} className="card product-card" style={{ position: 'relative' }}>
                  {isSold && (
                    <span className="badge" style={{ 
                      position: 'absolute', 
                      top: '12px', 
                      right: '12px', 
                      zIndex: 10,
                      background: 'var(--danger)',
                      color: '#fff',
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      Sold
                    </span>
                  )}
                  
                  {product.image_url && (
                    <div className="product-image-wrap" style={{ opacity: isSold ? 0.6 : 1 }}>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="product-image"
                      />
                    </div>
                  )}

                  <div className="card-body">
                    <h3 className="product-title">{product.name}</h3>
                    {product.description && <p className="product-description">{product.description}</p>}

                    <div className="product-footer">
                      <div>
                        <span className="price-label">Price</span>
                        <span className="price">${product.price}</span>
                      </div>

                      <button
                        className="btn btn-primary"
                        onClick={() => handlePurchase(product.id)}
                        disabled={loadingId === product.id || isSold}
                        style={{ opacity: isSold ? 0.5 : 1 }}
                      >
                        {loadingId === product.id ? 'Purchasing...' : isSold ? 'Sold' : 'Buy now'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
