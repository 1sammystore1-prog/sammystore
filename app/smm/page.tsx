'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

const PRESET_TIERS = [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];

export default function SmmPage() {
  const [services, setServices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [customQuantity, setCustomQuantity] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  // Pre-select category/service if arriving from the catalog page or search
  // (e.g. /smm?category=Instagram or /smm?service=1234)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const serviceParam = searchParams.get('service');

    if (serviceParam && services.length > 0) {
      const match = services.find((s: any) => String(s.service) === String(serviceParam));
      if (match) {
        setSelectedCategory(match.category || 'Other');
        setSelectedServiceId(String(serviceParam));
        return;
      }
    }
    if (categoryParam && !selectedCategory) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams, services]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/smm/services');
      const data = await res.json();
      if (data.success && Array.isArray(data.services)) {
        setServices(data.services);
      }
    } catch (error) {
      console.error('Failed to fetch SMM services:', error);
    }
    setLoading(false);
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => set.add(s.category || 'Other'));
    return Array.from(set).sort();
  }, [services]);

  const servicesInCategory = useMemo(() => {
    if (!selectedCategory) return [];
    return services.filter((s) => (s.category || 'Other') === selectedCategory);
  }, [services, selectedCategory]);

  const selectedService = useMemo(
    () => services.find((s: any) => String(s.service) === String(selectedServiceId)) || null,
    [services, selectedServiceId]
  );

  const quantityOptions = useMemo(() => {
    if (!selectedService) return [];
    const min = parseInt(selectedService.min) || 1;
    const max = parseInt(selectedService.max) || Infinity;
    const options = PRESET_TIERS.filter((q) => q >= min && q <= max);
    if (!options.includes(min)) options.unshift(min);
    if (max !== Infinity && !options.includes(max)) options.push(max);
    return Array.from(new Set(options)).sort((a, b) => a - b);
  }, [selectedService]);

  const priceFor = (qty: number) => {
    if (!selectedService) return 0;
    return (selectedService.rate * qty) / 1000;
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedServiceId('');
    setQuantity('');
    setCustomQuantity('');
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setQuantity('');
    setCustomQuantity('');
  };

  const effectiveQuantity = quantity === 'custom' ? parseInt(customQuantity) || 0 : parseInt(quantity) || 0;

  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMsg, setCartMsg] = useState('');

  const handleAddToCart = async () => {
    if (!selectedService || !link || !effectiveQuantity) return;
    setAddingToCart(true);
    setCartMsg('');

    const token = localStorage.getItem('token');
    if (!token) {
      setCartMsg('Please login to add to cart');
      setAddingToCart(false);
      return;
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: 'smm',
          productId: selectedService.service,
          name: selectedService.name,
          category: selectedService.category,
          unitPrice: selectedService.rate,
          quantity: effectiveQuantity,
          link,
        }),
      });
      const data = await res.json();
      setCartMsg(data.success ? 'Added to cart!' : data.error || 'Failed to add to cart');
    } catch (error: any) {
      setCartMsg('Network error: ' + error.message);
    }
    setAddingToCart(false);
  };

  const handleOrder = async () => {
    setPurchasing(true);
    setMsg('');
    setOrderData(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setMsgType('error');
      setMsg('Please login to place orders');
      setPurchasing(false);
      return;
    }

    try {
      const res = await fetch('/api/smm/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          service: selectedServiceId,
          link,
          quantity: effectiveQuantity
        })
      });
      const data = await res.json();

      if (data.success) {
        setMsgType('success');
        setMsg('Order placed successfully!');
        setOrderData(data);
      } else {
        setMsgType('error');
        setMsg(data.error || 'Order failed');
      }
    } catch (error: any) {
      setMsgType('error');
      setMsg('Network error: ' + error.message);
    }
    setPurchasing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#b3001f] mb-4 transition-colors">
            ← Back to Dashboard
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#b3001f] mb-4 transition-colors">
            ← Back to Dashboard
          </Link>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">SMM Panel</h1>
            <p className="text-gray-600">Boost your social media presence</p>
          </div>

          <div className="card p-6 md:p-8 max-w-2xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#b3001f] mb-3"></div>
                <p className="text-gray-600 text-sm">Loading services...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No SMM services available right now. Please try again shortly.</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Choose a category...</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Service</label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    className="input-field"
                    disabled={!selectedCategory}
                  >
                    <option value="">
                      {selectedCategory ? 'Choose a service...' : 'Select a category first'}
                    </option>
                    {servicesInCategory.map((service: any) => (
                      <option key={service.service} value={service.service}>
                        {service.name} - ₦{service.rate.toLocaleString()}/1000
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity & Price</label>
                  <select
                    value={quantity}
                    onChange={(e) => { setQuantity(e.target.value); setCustomQuantity(''); }}
                    className="input-field"
                    disabled={!selectedService}
                  >
                    <option value="">
                      {selectedService ? 'Choose a quantity...' : 'Select a service first'}
                    </option>
                    {quantityOptions.map((qty) => (
                      <option key={qty} value={qty}>
                        {qty.toLocaleString()} - ₦{priceFor(qty).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </option>
                    ))}
                    {selectedService && <option value="custom">Custom amount...</option>}
                  </select>

                  {quantity === 'custom' && selectedService && (
                    <div className="mt-3">
                      <input
                        type="number"
                        value={customQuantity}
                        onChange={(e) => setCustomQuantity(e.target.value)}
                        placeholder={`Enter quantity (min ${selectedService.min || 1}, max ${selectedService.max || '∞'})`}
                        className="input-field"
                        min={selectedService.min || 1}
                        max={selectedService.max || undefined}
                      />
                      {customQuantity && (
                        <p className="text-sm text-gray-600 mt-2">
                          Price: <span className="font-bold text-[#b3001f]">
                            ₦{priceFor(parseInt(customQuantity) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Target Link</label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://instagram.com/username"
                className="input-field"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || !selectedServiceId || !link || !effectiveQuantity}
                className="btn-secondary flex-1 disabled:opacity-50"
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={handleOrder}
                disabled={purchasing || !selectedServiceId || !link || !effectiveQuantity}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {purchasing ? 'Processing...' : 'Place Order'}
              </button>
            </div>

            {cartMsg && (
              <div className="mt-3 p-3 rounded-lg bg-primary-50 text-[#b3001f] text-sm font-semibold">
                {cartMsg}
              </div>
            )}

            {msg && (
              <div className={`mt-6 p-4 rounded-xl ${
                msgType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <p className="font-semibold">{msg}</p>
              </div>
            )}

            {orderData && (
              <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4">Order Details:</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Order ID: </span>
                    <span className="font-mono font-semibold">{orderData.orderId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Service: </span>
                    <span className="font-semibold">{selectedService?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Quantity: </span>
                    <span className="font-semibold">{effectiveQuantity.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
