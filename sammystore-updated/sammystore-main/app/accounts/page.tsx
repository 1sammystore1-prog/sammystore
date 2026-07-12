'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function AccountsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [buying, setBuying] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [accountData, setAccountData] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/accounts/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
    setLoading(false);
  };

  const handleBuy = async () => {
    if (!selectedProduct) return;
    
    setBuying(true);
    setMsg('');
    setAccountData(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setMsgType('error');
      setMsg('Please login to purchase');
      setBuying(false);
      return;
    }

    try {
      const res = await fetch('/api/accounts/buy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          productId: selectedProduct.id,
          amount: 1,
          price: selectedProduct.price
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setMsgType('success');
        setMsg('Account purchased successfully!');
        setAccountData(data.accountData);
      } else {
        setMsgType('error');
        setMsg(data.error || 'Purchase failed');
      }
    } catch (error: any) {
      setMsgType('error');
      setMsg('Network error: ' + error.message);
    }
    setBuying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f97316] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Buy Accounts</h1>
            <p className="text-gray-600">Premium verified accounts for all platforms</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={`card p-6 cursor-pointer transition-all ${
                  selectedProduct?.id === product.id
                    ? 'border-2 border-[#f97316] bg-orange-50'
                    : 'border-2 border-transparent hover:border-gray-300'
                }`}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {product.name || product.title}
                </h3>
                <p className="text-2xl font-bold text-[#f97316] mb-2">
                  ₦{parseFloat(product.price || '0').toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  {product.stock || 'In Stock'} available
                </p>
              </div>
            ))}
          </div>

          {selectedProduct && (
            <div className="card p-6 md:p-8 max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {selectedProduct.name || selectedProduct.title}
              </h2>
              <p className="text-3xl font-bold text-[#f97316] mb-6">
                ₦{parseFloat(selectedProduct.price || '0').toLocaleString()}
              </p>
              <button
                onClick={handleBuy}
                disabled={buying}
                className="btn-primary w-full disabled:opacity-50"
              >
                {buying ? 'Processing...' : 'Purchase Now'}
              </button>

              {msg && (
                <div className={`mt-6 p-4 rounded-xl ${
                  msgType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  <p className="font-semibold">{msg}</p>
                </div>
              )}

              {accountData && (
                <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4">Account Details:</h3>
                  <div className="font-mono text-sm bg-white p-4 rounded-lg">
                    {typeof accountData === 'object' 
                      ? JSON.stringify(accountData, null, 2) 
                      : accountData}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
