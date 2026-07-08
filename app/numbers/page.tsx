'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function VirtualNumbersPage() {
  const [countries, setCountries] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [buying, setBuying] = useState(false);
  const [checkingSms, setCheckingSms] = useState(false);
  
  const [orderId, setOrderId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Fetch Countries on load
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('/api/numbers/countries');
        const data = await res.json();
        if (data.success && data.countries) {
          // 5sim returns an object, convert to array
          const countryList = Object.entries(data.countries).map(([code, info]: [string, any]) => ({
            code,
            name: info.name || code.toUpperCase(),
            flag: info.img || ''
          }));
          setCountries(countryList.sort((a, b) => a.name.localeCompare(b.name)));
        }
      } catch (err) {
        setError('Failed to load countries');
      }
      setLoadingCountries(false);
    };
    fetchCountries();
  }, []);

  // 2. Fetch Services when country changes
  useEffect(() => {
    if (!selectedCountry) return;
    
    const fetchServices = async () => {
      setLoadingServices(true);
      setServices([]);
      setSuccessMsg('');
      setError('');
      try {
        const res = await fetch(`/api/numbers/products?country=${selectedCountry}`);
        const data = await res.json();
        if (data.success && data.products) {
          // 5sim returns an object of products
          const productList = Object.entries(data.products).map(([id, info]: [string, any]) => ({
            id,
            name: info.name || id
          }));
          setServices(productList.sort((a, b) => a.name.localeCompare(b.name)));
        }
      } catch (err) {
        setError('Failed to load services');
      }
      setLoadingServices(false);
    };
    fetchServices();
  }, [selectedCountry]);

  // 3. Buy Number
  const handleBuy = async () => {
    if (!selectedCountry || !selectedService) {
      setError('Please select a country and service');
      return;
    }

    setBuying(true);
    setError('');
    setSuccessMsg('');
    setSmsCode('');
    setOrderId('');
    setPhoneNumber('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to purchase');
      setBuying(false);
      return;
    }

    try {
      const res = await fetch('/api/numbers/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          country: selectedCountry,
          product: selectedService
        })
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg('Number acquired successfully!');
        setOrderId(data.orderId);
        setPhoneNumber(data.phoneNumber);
      } else {
        setError(data.error || 'Failed to buy number');
      }
    } catch (err: any) {
      setError('Network error: ' + err.message);
    }
    setBuying(false);
  };

  // 4. Check SMS
  const handleCheckSms = async () => {
    if (!orderId) return;
    setCheckingSms(true);
    try {
      const res = await fetch(`/api/numbers/sms?orderId=${orderId}`);
      const data = await res.json();
      if (data.success && data.sms) {
        // 5sim returns sms in data.sms.sms or similar structure
        const code = data.sms.sms || data.sms.text || JSON.stringify(data.sms);
        setSmsCode(code);
      } else {
        setSmsCode('No SMS received yet. Please wait and try again.');
      }
    } catch (err) {
      setError('Failed to check SMS');
    }
    setCheckingSms(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#f97316] to-[#ea580c] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-xl font-bold text-gray-800">SAMMY<span className="text-[#f97316]">STORE</span></span>
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-[#f97316]">
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Virtual Numbers</h1>
          <p className="text-gray-600">Get instant SMS verification numbers worldwide</p>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            ⚠️ {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
            ✅ {successMsg}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
          {/* Step 1: Country */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">1. Select Country</label>
            {loadingCountries ? (
              <div className="text-gray-500 text-sm">Loading countries...</div>
            ) : (
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent bg-gray-50"
              >
                <option value="">Choose a country...</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag && <span className="mr-2">{c.flag}</span>}
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Step 2: Service */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">2. Select Service</label>
            {!selectedCountry ? (
              <div className="text-gray-500 text-sm">Please select a country first</div>
            ) : loadingServices ? (
              <div className="text-gray-500 text-sm">Loading services...</div>
            ) : (
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent bg-gray-50"
              >
                <option value="">Choose a service...</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Step 3: Buy Button */}
          <button
            onClick={handleBuy}
            disabled={buying || !selectedCountry || !selectedService}
            className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {buying ? 'Processing...' : 'Get Number'}
          </button>

          {/* Results Area */}
          {phoneNumber && (
            <div className="mt-8 p-6 bg-orange-50 border border-orange-200 rounded-xl">
              <h3 className="font-bold text-gray-800 mb-4">Your Number Details</h3>
              
              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Phone Number</p>
                  <p className="text-xl font-mono font-bold text-gray-800">{phoneNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Order ID</p>
                  <p className="text-sm font-mono text-gray-600">{orderId}</p>
                </div>
              </div>

              <div className="border-t border-orange-200 pt-4">
                <p className="text-xs text-gray-500 uppercase mb-2">SMS Code</p>
                {smsCode ? (
                  <div className="p-3 bg-white rounded-lg border border-orange-200 font-mono text-lg text-green-600 font-bold break-all">
                    {smsCode}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-3">Waiting for SMS...</p>
                )}
                
                <button
                  onClick={handleCheckSms}
                  disabled={checkingSms}
                  className="mt-3 w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
                >
                  {checkingSms ? 'Checking...' : 'Check for SMS'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
