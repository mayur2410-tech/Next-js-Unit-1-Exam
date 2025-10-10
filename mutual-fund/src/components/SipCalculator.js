'use client';
import { useState } from 'react';
import LineChart from './LineChart'; // Reusing our custom chart component
import { FaMoneyBillWave, FaChartArea, FaCalculator } from 'react-icons/fa';

export default function SipCalculator({ schemeCode }) {
  const [amount, setAmount] = useState(500);
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`/api/scheme/${schemeCode}/sip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            amount: parseFloat(amount), 
            frequency: 'monthly',
            from: fromDate, 
            to: toDate 
        }),
      });
      
      const data = await response.json();

      if (!response.ok || data.needs_review) {
        throw new Error(data.message || 'SIP calculation failed.');
      }
      
      setResults(data);

    } catch (e) {
      setError(e.message || "An unknown error occurred during calculation.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-sky-500 focus:border-sky-500 transition-colors";
  
  // FIX: Correctly prepare chart data by calculating value at each point
  const chartData = results?.investmentHistory?.map(item => ({
    date: item.date,
    value: item.units * item.nav, // Correctly calculates value at each point
  })) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div className="lg:col-span-1 p-6 bg-gray-700 rounded-xl shadow-inner h-fit">
        <h2 className="text-2xl font-bold mb-4 flex items-center text-sky-400">
            <FaMoneyBillWave className="mr-3"/> SIP Calculator
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Monthly SIP Amount (₹)</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
              min="100"
              required
            />
          </div>
          <div>
            <label htmlFor="from" className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              id="from"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="to" className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              id="to"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Calculate SIP Returns'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-900 border border-red-600 rounded-lg text-red-300 text-sm">
            Error: {error}
          </div>
        )}
      </div>

      <div className="lg:col-span-2 space-y-6">
        {results ? (
          <>
            <div className="p-6 bg-gray-700 rounded-xl shadow-2xl border-l-4 border-sky-500">
              <h3 className="text-xl font-extrabold text-white mb-4">Investment Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <ResultItem label="Total Invested" value={`₹${results.totalInvested.toLocaleString('en-IN')}`} color="text-gray-300" />
                <ResultItem label="Current Value" value={`₹${results.currentValue.toLocaleString('en-IN')}`} color="text-green-500" />
                <ResultItem label="Total Units Purchased" value={results.totalUnits.toFixed(4)} color="text-gray-300" />
                <ResultItem label="Absolute Return (%)" value={`${results.absoluteReturn.toFixed(2)}%`} color={results.absoluteReturn >= 0 ? 'text-green-500' : 'text-red-500'} />
                <ResultItem label="Annualized Return (%)" value={`${results.annualizedReturn.toFixed(2)}%`} color={results.annualizedReturn >= 0 ? 'text-green-500' : 'text-red-500'} />
              </div>
            </div>

            <div className="p-6 bg-gray-700 rounded-xl shadow-2xl">
              <h3 className="text-xl font-bold mb-4 flex items-center text-sky-400">
                <FaChartArea className="mr-3"/> SIP Value Growth
              </h3>
              <LineChart 
                data={chartData} 
                title="Investment Value" 
                color="#06b6d4" 
              />
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-gray-400 lg:col-span-2 bg-gray-700 rounded-xl shadow-inner">
            <FaCalculator className="text-4xl mx-auto mb-3" />
            <p>Enter SIP parameters on the left and click 'Calculate' to see the detailed results and growth chart.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const ResultItem = ({ label, value, color }) => (
  <div className="border-b border-gray-600 pb-2">
    <p className="text-gray-400 text-xs uppercase tracking-wider">{label}</p>
    <p className={`text-lg font-bold ${color}`}>{value}</p>
  </div>
);
