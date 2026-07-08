'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function AccountsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [balance, setBalance] = useState(0);
  const [accountData, setAccountData] = useState<any>(null);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/accounts/products');
        const data = await res.json();
        if (data.success) {
          // DanOTP might return an object or array, we normalize it
          const prodList = Array.isArray(data.products) ? data.products : Object.values(data.products);
          setProducts(prodList);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleBuy = async () => {
    if (!selectedProduct) return;
    setBuying(true);
    setMsg('');
    setAccountData(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setMsgType('error');
      setMsg('Please login');
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
        setMsg(data.message);
        setAccountData(data.accountData);
        setBalance(data.newBalance);
      } else {
        setMsgType('error');
        setMsg(data.error);
      }
    } catch (e) {
      setMsgType('error');
      setMsg('Network error');
    }
    setBuying(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="mb-8">
            <p className="terminal-text text-sm mb-2">{`> MODULE: ACCOUNT_MARKET`}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#e0e0e0]">BUY ACCOUNTS</h1>
            {balance > 0 && <p className="text-[#00ff88] font-mono mt-2">Balance: ₦{balance}</p>}
          </div>

          {loading ? (
            <p className="text-[#a0a0b0] font-mono">Loading stock...</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {products.map((product: any) => (
                <div 
                  key={product.id} 
                  onClick={() => setSelectedProduct(product)}
                  className={`card-dark cursor-pointer border-2 transition-all ${
                    selectedProduct?.id === product.id 
                      ? 'border-[#00ff88] bg-[#00ff88]/5' 
                      : 'border-[#2a2a3a]'
                  }`}
                >
                  <h3 className="text-xl font-bold text-[#e0e0e0] mb-2">{product.name || product.title}</h3>
                  <p className="text-[#ffd700] font-mono text-lg mb-2">₦{product.price}</p>
                  <p className="text-[#00ff88] text-sm font-mono">{product.stock || 'In Stock'} available</p>
                </div>
              ))}
            </div>
          )}
          
          {selectedProduct && (
            <div className="card-dark max-w-2xl">
              <h3 className="text-2xl font-bold text-[#00f5ff] mb-4">{selectedProduct.name || selectedProduct.title}</h3>
              <p className="text-[#ffd700] font-mono text-2xl mb-4">₦{selectedProduct.price}</p>
              <button onClick={handleBuy} disabled={buying} className="btn-neon-green w-full">
                {buying ? 'SECURING ACCOUNT...' : 'PURCHASE NOW'}
              </button>
              
              {msg && (
                <div className={`mt-6 p-4 rounded text-center border ${
                  msgType === 'success' 
                    ? 'border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]' 
                    : 'border-[#ff2a6d] bg-[#ff2a6d]/10 text-[#ff2a6d]'
                }`}>
                  <p className="font-mono font-bold">{msg}</p>
                </div>
              )}

              {accountData && (
                <div className="mt-6 p-6 border border-[#00ff88]/30 bg-[#00ff88]/5 rounded-lg">
                  <h3 className="text-[#00ff88] font-mono mb-4">{`> ACCOUNT_ACQUIRED:`}</h3>
                  <div className="font-mono text-sm text-[#e0e0e0] break-all">
                    {typeof accountData === 'object' ? JSON.stringify(accountData, null, 2) : accountData}
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
