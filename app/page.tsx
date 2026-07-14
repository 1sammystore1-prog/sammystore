'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [recentPurchases, setRecentPurchases] = useState([
    { user: 'Fuj***', item: 'WhatsApp (USA)', price: '₦5,200', time: '2 mins ago' },
    { user: 'Ble***', item: 'Virtual Number', price: '₦850', time: '5 mins ago' },
    { user: 'Eli***', item: 'Instagram 1000+', price: '₦8,000', time: '8 mins ago' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#b3001f] to-[#8c0018] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-800">SAMMY</span>
                <span className="text-[#b3001f] font-bold">STORE</span>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-[#b3001f] font-medium">
                Login
              </Link>
              <Link href="/register" className="btn-primary">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gray-800">Premium Digital </span>
            <span className="text-[#b3001f]">Provider</span>
            <br />
            <span className="text-gray-800">for Every Market</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            SammyStore: Your all-in-one gateway to premium digital products. Virtual numbers, social media accounts, 
            and growth tools everything you need in one place.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
              <span className="text-[#b3001f]">✓</span>
              <span className="text-gray-700 font-medium">100% Verified</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
              <span className="text-[#b3001f]"></span>
              <span className="text-gray-700 font-medium">Instant Delivery</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
              <span className="text-[#b3001f]">🔒</span>
              <span className="text-gray-700 font-medium">Secure Payments</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#how-it-works" className="btn-primary text-lg px-8 inline-block text-center">
              Watch how to use our site and more →
            </a>
            <a href="#services" className="btn-secondary text-lg px-8 inline-block text-center">
              Tap below to browse Services ↓
            </a>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/accounts" className="card p-6 text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Social Media</h3>
              <p className="text-gray-600 text-sm">Buy your strong logs</p>
            </Link>

            <Link href="/numbers" className="card p-6 text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white text-3xl">📞</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Virtual Number</h3>
              <p className="text-gray-600 text-sm">Your online identity simplified</p>
            </Link>

            <Link href="/smm" className="card p-6 text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white text-3xl"></span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Boost</h3>
              <p className="text-gray-600 text-sm">More engagement, more influence</p>
            </Link>

            <Link href="/accounts" className="card p-6 text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white text-3xl"></span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Buy Accounts</h3>
              <p className="text-gray-600 text-sm">Premium verified accounts</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Purchases Ticker */}
      <section className="bg-white py-8 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">RECENT PURCHASES - ALL CATEGORIES</h3>
          <div className="flex overflow-x-auto space-x-6 pb-2">
            {recentPurchases.map((purchase, idx) => (
              <div key={idx} className="flex items-center space-x-2 whitespace-nowrap">
                <span className="text-[#b3001f] font-semibold">{purchase.user}</span>
                <span className="text-gray-600">bought</span>
                <span className="text-gray-800 font-medium">{purchase.item}</span>
                <span className="text-[#b3001f] font-semibold">{purchase.price}</span>
                <span className="text-gray-400 text-sm">{purchase.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">How To Get Started</h2>
          <p className="text-gray-600 mb-12">Get what you need in minutes; simple, fast, and secure</p>
          
          <div className="space-y-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-[#b3001f] text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Choose Your Item</h3>
              <p className="text-gray-600 max-w-md">Browse through our collection of products and select what works for you</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-[#b3001f] text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Checkout Fast</h3>
              <p className="text-gray-600 max-w-md">Pay using your wallet, card, or bank transfer — no complicated steps</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-[#b3001f] text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Get It Instantly</h3>
              <p className="text-gray-600 max-w-md">Your purchase is available right away in your order history</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                <span className="text-[#b3001f]">Sammy</span>Store
              </h3>
              <p className="text-gray-400">Your premium digital provider for virtual numbers, social media accounts, and growth tools.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-[#b3001f]">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-[#b3001f]">Contact</Link></li>
                <li><Link href="/faq" className="hover:text-[#b3001f]">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-gray-400">📧 support@sammystore.com</p>
              <p className="text-gray-400">📱 +234 XXX XXX XXXX</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
