// components/Navbar.jsx
"use client";
import React, { useState } from 'react';
import { Search, ChevronDown, TrendingUp, Wallet, DollarSign, Clock, Calculator, BarChart3, SearchIcon } from 'lucide-react';

/**
 * Navbar component for the Groww clone.
 * This component handles navigation links, the search bar, the login/signup button,
 * and the 'More' dropdown menu for calculators.
 */
const Navbar = () => {
  // Navigation items for the main menu
  const navItems = [
    { name: 'Stocks', href: '#' },
    { name: 'F&O', href: '#' },
    { name: 'Mutual Funds', href: '/mutual-funds' },
  ];

  // Calculator links data, split into two columns for the dropdown menu
  const calculatorItems = [
    { 
      name: 'SIP Calculator', 
      description: 'Estimate returns on a SIP', 
      href: '/calculators/sip'
    },
    { 
      name: 'Step-up SIP Calculator', 
      description: 'Plan incremental SIP investments', 
      href: '/calculators/stepup-sip' 
    },
    { 
      name: 'SWP Calculator', 
      description: 'Returns on your systematic withdrawal plan', 
      href: '/calculators/swp'
    },
    // Second Column starts here
    { 
      name: 'Lumpsum Calculator', 
      description: 'Estimate returns on a one-time investment', 
      href: '/calculators/lumpsum'
    },
    { 
      name: 'EMI Calculator', 
      description: 'Calculate your loan equated monthly installments', 
      href: '/calculators/emi'
    },
    // Placeholder items to match the two-column layout visually (as seen in video)
    { 
      name: 'Brokerage calculator', 
      description: 'Estimate charges for your trades/investment', 
      href: '/calculators/brokerage' 
    },
  ];
  
  // State for controlling the visibility of the 'More' dropdown
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Split items into two columns
  const firstColumn = calculatorItems.slice(0, 3);
  const secondColumn = calculatorItems.slice(3);


  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        
        {/* Left Section: Logo and Nav Items */}
        <div className="flex items-center space-x-8">
          {/* Logo - Preserving 'MF Grow' and bold style */}
          <a href="/" className="flex items-center text-xl font-extrabold text-black tracking-tight">
            <span className="w-4 h-4 rounded-full bg-[#00D09C] mr-2"></span>
            MFGrow
          </a>

          {/* Nav Items (Hidden on small screens) */}
          <div className="hidden lg:flex items-center space-x-6 text-sm font-bold text-gray-500">
            {navItems.map((item) => (
              <a 
                key={item.name} 
                href={item.href} 
                className="hover:text-gray-900 transition duration-150"
              >
                {item.name}
              </a>
            ))}
            
            {/* More Menu Item with Hover Dropdown */}
            <div 
              className="relative h-full flex items-center" // Ensure h-full for better hover boundary
              onMouseEnter={() => setIsMoreOpen(true)}
              onMouseLeave={() => setIsMoreOpen(false)}
            >
                <button className="flex items-center text-gray-500 font-bold hover:text-gray-900 transition duration-150 py-2">
                    More 
                    <ChevronDown 
                        className="w-3 h-3 ml-1 text-gray-500 transition-transform duration-200" 
                        style={{ transform: isMoreOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} 
                    />
                </button>
                
                {/* Dropdown Content */}
                {isMoreOpen && (
                    <div className="absolute top-full mt-0 left-1/2 -translate-x-1/2 w-max bg-white border border-gray-100 rounded-xl shadow-2xl p-6">
                        <div className="flex space-x-12">
                            
                            {/* Left Column */}
                            <div className="w-64 space-y-2">
                                <h3 className="text-xs font-semibold uppercase text-gray-400 mb-3 border-b border-gray-100 pb-1">Calculators</h3>
                                {firstColumn.map((item) => (
                                    <a key={item.name} href={item.href} className="block p-2 rounded-lg hover:bg-gray-50 transition duration-150">
                                        <p className="text-sm font-semibold text-gray-700">{item.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                                    </a>
                                ))}
                            </div>

                            {/* Right Column */}
                            <div className="w-64 space-y-2 border-l border-gray-100 pl-12">
                                <h3 className="text-xs font-semibold uppercase text-gray-400 mb-3 border-b border-gray-100 pb-1">Tools & Info</h3>
                                {secondColumn.map((item) => (
                                    <a key={item.name} href={item.href} className="block p-2 rounded-lg hover:bg-gray-50 transition duration-150">
                                        <p className="text-sm font-semibold text-gray-700">{item.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                                    </a>
                                ))}
                            </div>
                        </div>
                        {/* Dropdown Pointer (Triangle) */}
                        <div className="absolute top-[-8px] left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-100"></div>
                    </div>
                )}
            </div>
          </div>
        </div>
        
        {/* Right Section: Search and Login/Signup */}
        <div className="flex items-center space-x-4">
          
          {/* Search Bar (Optimized for desktop) */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 border border-transparent focus-within:border-[#00D09C] transition-colors duration-200 w-full max-w-xs xl:max-w-md">
            {/* Using standard Search icon with corrected sizing */}
            <Search className="w-4 h-4 text-gray-500 mr-2" /> 
            <input
              type="text"
              placeholder="Search Funds..."
              className="bg-transparent text-sm w-full focus:outline-none placeholder-gray-500"
            />
            {/* Keyboard shortcut indicator */}
            <span className="ml-2 text-xs text-gray-400 border border-gray-300 px-1 rounded-sm">
                Ctrl+K
            </span>
          </div>

          {/* Login/Signup Button */}
          <button className="bg-[#00D09C] text-white font-semibold py-2 px-4 rounded-lg w-full h-10 shadow-md hover:bg-[#00BFA5] transition duration-200 text-sm">
            Login/Sign up
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
