'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function VtuPage() {
  const [serviceType, setServiceType] = useState('airtime');
  const [network, setNetwork] = useState('1');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [balance, setBalance] = useState(0);

  // Cable & Electricity fields
  const [iuc, setIuc] = useState('');
  const [meterNumber, setMeterNumber] = useState('');
  const [disco, setDisco] = useState('');
  const [meterType, setMeterType] = useState('prepaid');
  const [verifiedName, setVerifiedName] = useState('');

  useEffect(() => {
    fetchPlans();
  }, [serviceType, network]);

  const fetchPlans = async () => {
    try {
      const res = await fetch(`/api/vtu/plans?type=${serviceType}&network=${network}`);
      const data = await res.json();
      if (data.success) {
        setPlans(data.plans || []);
        if (data.plans?.length > 0) {
          setSelectedPlan(data.plans[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const verifyIUC = async () => {
    try {
      const res = await fetch(`/api/vtu/verify-iuc?iuc=${iuc}&cable_id=${network}`);
      const data = await res.json();
      if (data.success) {
        setVerifiedName(data.data?.name || 'Verified');
      }
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  const verifyMeter = async () => {
    try {
      const res = await fetch(`/api/vtu/verify-meter?meter_number=${meterNumber}&disco=${network}&meter_type=${meterType}`);
      const data = await res.json();
      if (data.success) {
        setVerifiedName(data.data?.name || 'Verified');
      }
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  const handlePurchase = async () => {
    setLoading(true);
    setMsg('');
    
    const token = localStorage.getItem('token');
    if (!token) {
      setMsgType('error');
      setMsg('Please login');
      setLoading(false);
      return;
    }

    const body: any = {
      service_type: serviceType,
      request_id: Date.now().toString()
    };

    if (serviceType === 'airtime') {
      body.network = network;
      body.phone = phone;
      body.amount = amount;
    } else if (serviceType === 'data') {
      body.network = network;
      body.phone = phone;
      body.plan_id = selectedPlan;
    } else if (serviceType === 'cable') {
      body.cable_id = network;
      body.iuc = iuc;
      body.plan_id = selectedPlan;
    } else if (serviceType === 'electricity') {
      body.disco = network;
      body.meter_number = meterNumber;
      body.meter_type = meterType;
      body.amount = amount;
    }

    try {
      const res = await fetch('/api/vtu/purchase', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        setMsgType('success');
        setMsg(data.message);
        setBalance(data.newBalance);
      } else {
        setMsgType('error');
        setMsg(data.error);
      }
    } catch (e) {
      setMsgType('error');
      setMsg('Network error');
    }
    setLoading(false);
  };

  const getNetworks = () => {
    if (serviceType === 'airtime' || serviceType === 'data') {
      return [
        { id: '1', name: 'MTN' },
        { id: '2', name: 'GLO' },
        { id: '3', name: 'AIRTEL' },
        { id: '4', name: '9MOBILE' }
      ];
    } else if (serviceType === 'cable') {
      return [
        { id: '1', name: 'DSTV' },
        { id: '2', name: 'GOTV' },
        { id: '3', name: 'STARTIMES' }
      ];
    } else if (serviceType === 'electricity') {
      return [
        { id: '1', name: 'IKEDC' },
        { id: '2', name: 'EKEDC' },
        { id: '3', name: 'AEDC' },
        { id: '4', name: 'KADUNA' }
      ];
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="mb-8">
            <p className="terminal-text text-sm mb-2">{`> MODULE: VTU_SERVICES`}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#e0e0e0]">AIRTIME & DATA</h1>
            {balance > 0 && <p className="text-[#00ff88] font-mono mt-2">Balance: ₦{balance}</p>}
          </div>

          <div className="card-dark max-w-2xl">
            {/* Service Type */}
            <div className="mb-6">
              <label className="block text-[#00f5ff] text-sm font-mono mb-2">{`> SERVICE_TYPE`}</label>
              <select value={serviceType} onChange={(e) => { setServiceType(e.target.value); setNetwork('1'); }} className="input-dark">
                <option value="airtime">AIRTIME</option>
                <option value="data">DATA BUNDLE</option>
                <option value="cable">CABLE TV</option>
                <option value="electricity">ELECTRICITY</option>
              </select>
            </div>

            {/* Network/Provider */}
            <div className="mb-6">
              <label className="block text-[#00f5ff] text-sm font-mono mb-2">{`> PROVIDER`}</label>
              <select value={network} onChange={(e) => setNetwork(e.target.value)} className="input-dark">
                {getNetworks().map((n) => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
            </div>

            {/* Phone Number (for Airtime & Data) */}
            {(serviceType === 'airtime' || serviceType === 'data') && (
              <div className="mb-6">
                <label className="block text-[#00f5ff] text-sm font-mono mb-2">{`> PHONE_NUMBER`}</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" className="input-dark" />
              </div>
            )}

            {/* IUC Number (for Cable) */}
            {serviceType === 'cable' && (
              <div className="mb-6">
                <label className="block text-[#00f5ff] text-sm font-mono mb-2">{`> IUC_NUMBER`}</label>
                <div className="flex gap-2">
                  <input type="text" value={iuc} onChange={(e) => setIuc(e.target.value)} placeholder="IUC123456" className="input-dark flex-1" />
                  <button onClick={verifyIUC} className="btn-neon-purple px-4">VERIFY</button>
                </div>
                {verifiedName && <p className="text-[#00ff88] text-sm mt-2">Name: {verifiedName}</p>}
              </div>
            )}

            {/* Meter Number (for Electricity) */}
            {serviceType === 'electricity' && (
              <div className="mb-6">
                <label className="block text-[#00f5ff] text-sm font-mono mb-2">{`> METER_NUMBER`}</label>
                <div className="flex gap-2 mb-4">
                  <input type="text" value={meterNumber} onChange={(e) => setMeterNumber(e.target.value)} placeholder="Meter Number" className="input-dark flex-1" />
                  <button onClick={verifyMeter} className="btn-neon-purple px-4">VERIFY</button>
                </div>
                <select value={meterType} onChange={(e) => setMeterType(e.target.value)} className="input-dark">
                  <option value="prepaid">PREPAID</option>
                  <option value="postpaid">POSTPAID</option>
                </select>
                {verifiedName && <p className="text-[#00ff88] text-sm mt-2">Name: {verifiedName}</p>}
              </div>
            )}

            {/* Amount (for Airtime & Electricity) */}
            {(serviceType === 'airtime' || serviceType === 'electricity') && (
              <div className="mb-6">
                <label className="block text-[#00f5ff] text-sm font-mono mb-2">{`> AMOUNT (NGN)`}</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1000" className="input-dark" />
              </div>
            )}

            {/* Plans (for Data & Cable) */}
            {(serviceType === 'data' || serviceType === 'cable') && plans.length > 0 && (
              <div className="mb-6">
                <label className="block text-[#00f5ff] text-sm font-mono mb-2">{`> SELECT_PLAN`}</label>
                <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} className="input-dark">
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - ₦{plan.price}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button onClick={handlePurchase} disabled={loading} className="btn-neon-green w-full">
              {loading ? 'PROCESSING...' : `PURCHASE ${serviceType.toUpperCase()}`}
            </button>

            {msg && (
              <div className={`mt-6 p-4 rounded text-center border ${msgType === 'success' ? 'border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]' : 'border-[#ff2a6d] bg-[#ff2a6d]/10 text-[#ff2a6d]'}`}>
                <p className="font-mono font-bold">{msg}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
