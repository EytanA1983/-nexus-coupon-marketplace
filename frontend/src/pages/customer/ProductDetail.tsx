import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../api/client';
import { PublicProduct, PurchaseResult } from '../../types';
import Loading from '../../components/Loading';
import AppHeader from '../../components/AppHeader';

type ProductWithSold = PublicProduct & { isSold?: boolean };

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductWithSold | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const { data } = await apiClient.get<PublicProduct>(`/customer/products/${id}`);
      setProduct({ ...data, isSold: false });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!product || !id) return;
    if (!confirm(`Purchase ${product.name} for $${product.price}?`)) return;

    setError('');
    setPurchasing(true);
    setPurchaseResult(null);

    try {
      const { data } = await apiClient.post<PurchaseResult>(`/customer/products/${id}/purchase`);
      setPurchaseResult(data);
      // Mark product as sold locally instead of reloading (server won't return it anymore)
      setProduct(prev => prev ? { ...prev, isSold: true } : null);
    } catch (err: any) {
          const errorMsg = err.response?.data?.message || 'Purchase failed';
      setError(errorMsg);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return (
    <div className="app-shell">
      <div className="container">
        <AppHeader title="Product Details" />
        <Loading message="Loading product..." />
      </div>
    </div>
  );
  if (error && !purchaseResult) return (
    <div className="app-shell">
      <div className="container">
        <AppHeader title="Product Details" />
        <div className="alert alert-error">{error}</div>
      </div>
    </div>
  );
  if (!product) return (
    <div className="app-shell">
      <div className="container">
        <AppHeader title="Product Details" />
        <div className="empty-state">Product not found</div>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <div className="container">
        <AppHeader title={product.name} subtitle={product.description} />
        <button className="btn btn-ghost" onClick={() => navigate('/customer/products')} style={{ marginBottom: '24px' }}>
          ← Back to Products
        </button>

        {purchaseResult ? (
          <div className="alert alert-success purchase-result">
            <div style={{ flex: 1 }}>
              <strong>Purchase successful.</strong>
              <div>Final price: ${purchaseResult.final_price}</div>
              <div>Value type: {purchaseResult.value_type}</div>
              <div>Coupon value: {purchaseResult.value_type === 'STRING' ? purchaseResult.value : <img src={purchaseResult.value} alt="Coupon QR Code" style={{ maxWidth: '200px', display: 'block', marginTop: '8px', borderRadius: '8px' }} />}</div>
            </div>
          </div>
        ) : null}

        {product.image_url && (
          <div style={{ marginBottom: '32px', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)', position: 'relative', opacity: product.isSold ? 0.6 : 1 }}>
            {product.isSold && (
              <span className="badge" style={{ 
                position: 'absolute', 
                top: '16px', 
                right: '16px', 
                zIndex: 10,
                background: 'var(--danger)',
                color: '#fff',
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: '700'
              }}>
                Sold
              </span>
            )}
            <img
              src={product.image_url}
              alt={product.name}
              style={{
                width: '100%',
                maxHeight: '400px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        )}

        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div className="price" style={{ fontSize: '42px' }}>${product.price}</div>
            </div>
          </div>

          {error ? <div className="alert alert-error">{error}</div> : null}

          <button
            className="btn btn-primary"
            onClick={handlePurchase}
            disabled={purchasing || product.isSold}
            style={{ width: '100%', padding: '14px', opacity: product.isSold ? 0.5 : 1 }}
          >
            {purchasing ? 'Purchasing...' : product.isSold ? 'Sold' : 'Purchase Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
