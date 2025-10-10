'use client';
import { useState, useEffect } from 'react';
import { FaTable, FaClock } from 'react-icons/fa';

const PERIODS = [
  { label: '1 Month', code: '1m' },
  { label: '3 Months', code: '3m' },
  { label: '6 Months', code: '6m' },
  { label: '1 Year', code: '1y' },
];

export default function PreComputedReturns({ schemeCode }) {
  const [returnsData, setReturnsData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReturns() {
      setLoading(true);
      try {
        const fetchPromises = PERIODS.map(period => 
           fetch(`/api/scheme/${schemeCode}/returns?period=${period.code}`) 
            .then(res => res.json())
            .then(data => ({ code: period.code, data: data }))
            .catch(error => ({ code: period.code, error: 'Fetch failed' }))
        );

        const results = await Promise.all(fetchPromises);
        
        const dataMap = results.reduce((acc, result) => {
          acc[result.code] = result.data || { error: result.error };
          return acc;
        }, {});
        
        setReturnsData(dataMap);

      } catch (error) {
        console.error("Error fetching pre-computed returns:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReturns();
  }, [schemeCode]);
  
  // Helper to determine text color based on return percentage
  const getReturnTextColor = (value) => {
    if (value === null || typeof value === 'string' || value === undefined) return 'text-gray-400';
    return value >= 0 ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div>
      <h3 className="text-2xl font-bold border-b border-gray-700 pb-3 mb-4 flex items-center">
        <FaTable className="mr-3 text-sky-400"/> Standard Returns Analysis
      </h3>
      
      {loading ? (
        <div className="text-center py-8 text-gray-400">
          <FaClock className="animate-spin inline mr-2" /> Calculating standard returns...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700 rounded-lg overflow-hidden shadow-xl">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Simple Return (%)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Annualized Return (CAGR %)</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {PERIODS.map(period => {
                const data = returnsData[period.code] || {};
                const simpleReturn = data.simpleReturn !== undefined ? data.simpleReturn : 'N/A';
                const annualizedReturn = data.annualizedReturn !== null ? data.annualizedReturn : 'N/A';

                return (
                  <tr key={period.code} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{period.label}</td>
                    
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${getReturnTextColor(simpleReturn)}`}>
                      {typeof simpleReturn === 'number' ? `${simpleReturn.toFixed(2)}%` : simpleReturn}
                    </td>
                    
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${getReturnTextColor(annualizedReturn)}`}>
                      {typeof annualizedReturn === 'number' ? `${annualizedReturn.toFixed(2)}%` : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}