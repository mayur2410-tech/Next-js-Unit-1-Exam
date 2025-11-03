"use client";

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const FundCalculators = ({ historicalNavs, fundData }) => {
  const [activeTab, setActiveTab] = useState('sip');
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipDuration, setSipDuration] = useState(5);
  const [stepUpPercentage, setStepUpPercentage] = useState(10);
  const [lumpsumAmount, setLumpsumAmount] = useState(100000);
  const [lumpsumDuration, setLumpsumDuration] = useState(5);
  const [swpAmount, setSwpAmount] = useState(1000000);
  const [withdrawalAmount, setWithdrawalAmount] = useState(5000);
  const [swpDuration, setSwpDuration] = useState(10);
  const [swpStepUp, setSwpStepUp] = useState(10);

  // Calculate CAGR based on historical NAV data
  const calculateCAGR = (years) => {
    if (!historicalNavs || historicalNavs.length < 2) return 0;
    
    const latestNav = parseFloat(historicalNavs[0].nav);
    const periodInDays = years * 365;
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - years);
    
    // Find NAV closest to startDate
    let startNav = null;
    let minDiff = Infinity;
    
    historicalNavs.forEach(item => {
      const itemDate = new Date(item.date.split('-').reverse().join('-'));
      const diff = Math.abs(itemDate - startDate);
      if (diff < minDiff) {
        minDiff = diff;
        startNav = parseFloat(item.nav);
      }
    });
    
    if (!startNav || startNav <= 0) return 0;
    
    const cagr = (Math.pow(latestNav / startNav, 1 / years) - 1) * 100;
    return Math.max(0, cagr); // Don't return negative returns
  };

  // Calculate SIP returns
  const calculateSIP = () => {
    const rate = calculateCAGR(sipDuration) / 100;
    const months = sipDuration * 12;
    const monthlyRate = rate / 12;
    
    let futureValue = 0;
    let totalInvested = 0;
    const data = [];
    let currentSip = sipAmount;
    
    for (let i = 1; i <= months; i++) {
      futureValue = (futureValue + currentSip) * (1 + monthlyRate);
      totalInvested += currentSip;
      
      // Increase SIP amount annually
      if (i % 12 === 0 && i < months) {
        currentSip = Math.round(currentSip * (1 + stepUpPercentage / 100));
      }
      
      if (i % 12 === 0 || i === 1 || i === months) {
        data.push({
          year: Math.ceil(i / 12),
          invested: totalInvested,
          value: futureValue,
          returns: futureValue - totalInvested
        });
      }
    }
    
    return {
      futureValue,
      totalInvested,
      returns: futureValue - totalInvested,
      returnPercentage: ((futureValue - totalInvested) / totalInvested) * 100,
      data
    };
  };

  // Calculate Lumpsum returns
  const calculateLumpsum = () => {
    const rate = calculateCAGR(lumpsumDuration) / 100;
    const futureValue = lumpsumAmount * Math.pow(1 + rate, lumpsumDuration);
    const returns = futureValue - lumpsumAmount;
    const returnPercentage = (returns / lumpsumAmount) * 100;
    
    const data = [];
    for (let i = 1; i <= lumpsumDuration; i++) {
      const yearValue = lumpsumAmount * Math.pow(1 + rate, i);
      data.push({
        year: i,
        invested: lumpsumAmount,
        value: yearValue,
        returns: yearValue - lumpsumAmount
      });
    }
    
    return {
      futureValue,
      totalInvested: lumpsumAmount,
      returns,
      returnPercentage,
      data
    };
  };

  // Calculate SWP returns
  const calculateSWP = () => {
    const rate = calculateCAGR(swpDuration) / 100;
    const monthlyRate = rate / 12;
    let corpus = swpAmount;
    let totalWithdrawn = 0;
    let currentWithdrawal = withdrawalAmount;
    const data = [];
    
    for (let year = 1; year <= swpDuration; year++) {
      let yearlyWithdrawn = 0;
      
      for (let month = 1; month <= 12; month++) {
        if (corpus <= 0) break;
        
        // Withdraw at the start of the month
        const withdrawal = Math.min(currentWithdrawal, corpus);
        corpus -= withdrawal;
        yearlyWithdrawn += withdrawal;
        
        // Appreciation at the end of the month
        corpus *= (1 + monthlyRate);
      }
      
      totalWithdrawn += yearlyWithdrawn;
      
      // Increase withdrawal amount annually for step-up SWP
      if (year < swpDuration) {
        currentWithdrawal = Math.round(currentWithdrawal * (1 + swpStepUp / 100));
      }
      
      data.push({
        year,
        withdrawn: totalWithdrawn,
        remainingCorpus: corpus,
        totalValue: totalWithdrawn + corpus
      });
    }
    
    return {
      totalInvested: swpAmount,
      totalWithdrawn,
      remainingCorpus: corpus,
      totalValue: totalWithdrawn + corpus,
      returnPercentage: ((totalWithdrawn + corpus - swpAmount) / swpAmount) * 100,
      data
    };
  };

  const renderSIPCalculator = () => {
    const { futureValue, totalInvested, returns, returnPercentage, data } = calculateSIP();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Investment (₹)</label>
            <input
              type="number"
              value={sipAmount}
              onChange={(e) => setSipAmount(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="500"
              step="500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Investment Period (Years)</label>
            <input
              type="number"
              value={sipDuration}
              onChange={(e) => setSipDuration(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="1"
              max="30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Step-up % (Yearly)</label>
            <input
              type="number"
              value={stepUpPercentage}
              onChange={(e) => setStepUpPercentage(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="0"
              max="100"
              step="1"
            />
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-500">Invested Amount</p>
              <p className="text-lg font-bold">₹{totalInvested.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-500">Est. Returns</p>
              <p className="text-lg font-bold text-green-600">₹{returns.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-lg font-bold">₹{futureValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-500">XIRR</p>
              <p className="text-lg font-bold">{returnPercentage.toFixed(2)}%</p>
            </div>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
              <Legend />
              <Line type="monotone" dataKey="invested" name="Invested" stroke="#3b82f6" />
              <Line type="monotone" dataKey="value" name="Future Value" stroke="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderLumpsumCalculator = () => {
    const { futureValue, totalInvested, returns, returnPercentage, data } = calculateLumpsum();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Investment Amount (₹)</label>
            <input
              type="number"
              value={lumpsumAmount}
              onChange={(e) => setLumpsumAmount(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="1000"
              step="1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Investment Period (Years)</label>
            <input
              type="number"
              value={lumpsumDuration}
              onChange={(e) => setLumpsumDuration(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="1"
              max="30"
            />
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-500">Invested Amount</p>
              <p className="text-lg font-bold">₹{totalInvested.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-500">Est. Returns</p>
              <p className="text-lg font-bold text-green-600">₹{returns.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-lg font-bold">₹{futureValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Expected Return Rate (CAGR)</p>
            <p className="text-2xl font-bold">{returnPercentage.toFixed(2)}%</p>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
              <Legend />
              <Line type="monotone" dataKey="invested" name="Invested" stroke="#3b82f6" />
              <Line type="monotone" dataKey="value" name="Future Value" stroke="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderSWPCalculator = (isStepUp = false) => {
    const { totalInvested, totalWithdrawn, remainingCorpus, totalValue, returnPercentage, data } = calculateSWP();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Investment Amount (₹)</label>
            <input
              type="number"
              value={swpAmount}
              onChange={(e) => setSwpAmount(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="100000"
              step="10000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Withdrawal (₹)</label>
            <input
              type="number"
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="1000"
              step="1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Withdrawal Period (Years)</label>
            <input
              type="number"
              value={swpDuration}
              onChange={(e) => setSwpDuration(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="1"
              max="30"
            />
          </div>
          {isStepUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yearly Withdrawal Increase (%)</label>
              <input
                type="number"
                value={swpStepUp}
                onChange={(e) => setSwpStepUp(Number(e.target.value))}
                className="w-full p-2 border rounded-md"
                min="0"
                max="50"
                step="1"
              />
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-500">Invested Amount</p>
              <p className="text-lg font-bold">₹{totalInvested.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-500">Total Withdrawn</p>
              <p className="text-lg font-bold text-green-600">₹{totalWithdrawn.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-500">Remaining Corpus</p>
              <p className="text-lg font-bold">₹{remainingCorpus.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-lg font-bold">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Expected Return Rate (CAGR)</p>
            <p className="text-2xl font-bold">{returnPercentage.toFixed(2)}%</p>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
              <Legend />
              <Line type="monotone" dataKey="withdrawn" name="Total Withdrawn" stroke="#3b82f6" />
              <Line type="monotone" dataKey="remainingCorpus" name="Remaining Corpus" stroke="#10b981" />
              <Line type="monotone" dataKey="totalValue" name="Total Value" stroke="#8b5cf6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Fund Calculators</h2>
      
      <div className="flex flex-wrap gap-2 mb-6 border-b">
        {[
          { id: 'sip', label: 'SIP Calculator' },
          { id: 'stepup-sip', label: 'Step-up SIP' },
          { id: 'lumpsum', label: 'Lumpsum' },
          { id: 'swp', label: 'SWP' },
          { id: 'stepup-swp', label: 'Step-up SWP' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id 
                ? 'bg-[#00D09C] text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="mt-4">
        {activeTab === 'sip' && renderSIPCalculator()}
        {activeTab === 'stepup-sip' && renderSIPCalculator()}
        {activeTab === 'lumpsum' && renderLumpsumCalculator()}
        {activeTab === 'swp' && renderSWPCalculator()}
        {activeTab === 'stepup-swp' && renderSWPCalculator(true)}
      </div>
      
      <div className="mt-6 text-xs text-gray-500 border-t pt-4">
        <p>Disclaimer: The calculations are based on the historical returns of this fund. Past performance is not indicative of future returns. The actual returns may vary based on market conditions and other factors.</p>
      </div>
    </div>
  );
};

export default FundCalculators;