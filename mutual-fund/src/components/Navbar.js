// components/Navbar.js
'use client';
import Link from 'next/link';
import { FaChartLine, FaSearch, FaBalanceScale, FaBrain } from 'react-icons/fa';

const navItems = [
  { name: 'Fund Screener', href: '/funds', icon: FaSearch },
  { name: 'Fund Battle', href: '/compare', icon: FaBalanceScale },
  { name: 'AI Analytics', href: '/scheme/100033', icon: FaBrain }, // Link to a sample scheme for the AI demo
];

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-sm shadow-xl border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <FaChartLine className="text-3xl text-sky-500" />
            <span className="text-2xl font-extrabold text-white">
              MF<span className="text-sky-400">ANALYTICS</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className="flex items-center text-gray-300 hover:text-sky-400 transition duration-150 group">
                <item.icon className="mr-2 text-lg group-hover:text-sky-500 transition-colors" />
                <span className='font-medium'>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Action Button */}
          <div className="hidden md:block">
            <Link href="/funds" className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition duration-200 transform hover:scale-105">
              Start Analyzing Now
            </Link>
          </div>

          {/* Mobile Menu Icon (Placeholder) */}
          {/* For a hackathon, a simple mobile menu icon can be a placeholder */}
        </div>
      </div>
    </nav>
  );
}