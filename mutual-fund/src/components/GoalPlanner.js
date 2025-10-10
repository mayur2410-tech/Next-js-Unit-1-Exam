// components/GoalPlanner.js
'use client';
import { useState } from 'react';
import { FaBullseye, FaChartLine } from 'react-icons/fa';

export default function GoalPlanner({ schemeCode }) {
  const [goal, setGoal] = useState(1000000);
  const [years, setYears] = useState(10);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`/api/scheme/${schemeCode}/goal?goal=${goal}&years=${years}`);
      const data = await response.json();

      if (!response.ok || data.needs_review) {
        throw new Error(data.message || 'Calculation failed due to insufficient data.');
      }
      setResults(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-sky-500 focus:border-sky-500 transition-colors";

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 flex items-center"><FaBullseye className="mr-3 text-sky-400"/> Goal-Based SIP Planner</h2>
      <p className="text-gray-400 mb-6">Determine the required monthly investment to achieve your financial goal based on historical scheme performance.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-gray-300 mb-2">Target Goal Amount (₹)</label>
          <input
            type="number"
            id="goal"
            value={goal}
            onChange={(e) => setGoal(parseFloat(e.target.value))}
            className={inputClass}
            min="1000"
            required
          />
        </div>
        
        <div>
          <label htmlFor="years" className="block text-sm font-medium text-gray-300 mb-2">Time Horizon (Years)</label>
          <input
            type="number"
            id="years"
            value={years}
            onChange={(e) => setYears(parseFloat(e.target.value))}
            className={inputClass}
            min="1"
            max="40"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Calculate Required SIP'}
        </button>
      </form>

      {/* Results Section */}
      {results && (
        <div className="mt-8 p-6 bg-gray-700 rounded-xl shadow-inner border-t-4 border-green-500">
          <h3 className="text-xl font-extrabold text-green-400 mb-4">Calculation Results</h3>
          <p className="text-2xl font-bold mb-4">Required Monthly SIP: <span className="text-green-500">₹{results.requiredMonthlySIP.toLocaleString('en-IN')}</span></p>
          
          <div className="flex justify-between border-t border-gray-600 pt-3 text-sm">
            <p className="text-gray-400">Estimated Annual Return (CAGR):</p>
            <p className="font-semibold text-gray-300">{results.estimatedAnnualReturn}%</p>
          </div>
          <p className="text-xs text-gray-500 mt-2 italic">{results.note}</p>
        </div>
      )}

      {error && (
        <div className="mt-8 p-4 bg-red-900 border border-red-600 rounded-lg text-red-300">
          Error: {error}
        </div>
      )}
    </div>
  );
}