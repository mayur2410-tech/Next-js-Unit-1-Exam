'use client';
import { useState, useEffect } from 'react';
import LineChart from '../../../components/LineChart.js';
import SipCalculator from '../../../components/SipCalculator.js';
import GoalPlanner from '../../../components/GoalPlanner.js';
import AiSummary from '../../../components/AiSummary.js';
import PreComputedReturns from '../../../components/PreComputedReturns.js';
import LoadingSpinner from '../../../components/LoadingSpinner.js';
import FundBattlePage from '../../compare/page.js'; // ✅ Reuse your comparison page
import { FaChartLine, FaCalculator, FaRocket, FaExchangeAlt, FaShieldAlt } from 'react-icons/fa';

// --- Data Fetching Hook ---
function useSchemeData(schemeCode) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const detailResponse = await fetch(`/api/scheme/${schemeCode}`);
        const returnsResponse = await fetch(`/api/scheme/${schemeCode}/returns?period=1y`);
        
        if (!detailResponse.ok) throw new Error("Failed to fetch scheme details.");
        if (!returnsResponse.ok) console.warn("Failed to fetch default 1y returns."); // Allow partial load

        const schemeData = await detailResponse.json();
        const oneYearReturnData = returnsResponse.ok ? await returnsResponse.json() : null;

        setData({
          ...schemeData,
          oneYearReturn: oneYearReturnData,
        });

      } catch (e) {
        console.error("Error loading scheme page:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [schemeCode]);

  return { data, loading };
}
// -------------------------

export default function SchemeDetailPage({ params }) {
  const schemeCode = params.code;
  const { data, loading } = useSchemeData(schemeCode);
  const [activeTab, setActiveTab] = useState('analysis');
  
  if (loading) return <LoadingSpinner />;
  if (!data || !data.meta) return <div className="text-center p-10 text-white">Fund data not found.</div>;

  const { meta, data: navHistory } = data;

  // Prepare data for the NAV Chart (Last 1 year only for cleaner visualization)
  const chartDataRaw = navHistory.slice(-252);
  const navChartData = chartDataRaw.map(d => ({
    date: d.date.slice(0, 5),
    value: d.nav,
  }));

  // Custom Tab Style Function
  const tabClass = (tabName) => `
    px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 
    ${activeTab === tabName 
      ? 'bg-sky-500 text-white shadow-lg' 
      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
    }
  `;

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="pb-6 border-b border-gray-700 mb-6">
          <h1 className="text-4xl font-extrabold text-sky-400 mb-1">{meta.scheme_name}</h1>
          <div className="flex items-center space-x-4 text-gray-400">
            <span className="bg-gray-700 px-3 py-1 rounded-full text-xs font-medium">{meta.fund_house}</span>
            <span className="bg-gray-700 px-3 py-1 rounded-full text-xs font-medium">{meta.scheme_category}</span>
          </div>
        </div>

        {/* AI Summary + Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <AiSummary schemeMeta={meta} />
          
          <div className="bg-gray-800 p-5 rounded-xl shadow-2xl border-l-4 border-amber-500">
            <h3 className="font-bold text-amber-400 flex items-center mb-2"><FaChartLine className="mr-2"/> 1Y CAGR (Annualized Return)</h3>
            <p className="text-3xl font-extrabold">{data.oneYearReturn?.annualizedReturn?.toFixed(2) || 'N/A'}%</p>
            <p className="text-sm text-gray-400 mt-1">Calculated from {data.oneYearReturn?.startDate || 'N/A'}</p>
          </div>
          
          <div className="bg-gray-800 p-5 rounded-xl shadow-2xl border-l-4 border-emerald-500">
            <h3 className="font-bold text-emerald-400 flex items-center mb-2"><FaShieldAlt className="mr-2"/> Last NAV</h3>
            <p className="text-3xl font-extrabold">₹ {navHistory[navHistory.length - 1]?.nav.toFixed(4)}</p>
            <p className="text-sm text-gray-400 mt-1">as of {navHistory[navHistory.length - 1]?.date}</p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 mb-6">
          <button className={tabClass('analysis')} onClick={() => setActiveTab('analysis')}>
            <FaChartLine className="inline mr-2" /> Performance Analysis
          </button>
          <button className={tabClass('sip')} onClick={() => setActiveTab('sip')}>
            <FaCalculator className="inline mr-2" /> SIP Calculator
          </button>
          <button className={tabClass('goal')} onClick={() => setActiveTab('goal')}>
            <FaRocket className="inline mr-2" /> Goal Planner (AI Feature)
          </button>
          <button className={tabClass('compare')} onClick={() => setActiveTab('compare')}>
            <FaExchangeAlt className="inline mr-2" /> Fund Battle
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 p-8 rounded-b-xl rounded-r-xl shadow-3xl">
          
          {/* 1. Performance Analysis */}
          {activeTab === 'analysis' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold border-b border-gray-700 pb-3 mb-4">NAV History (Last 1 Year)</h2>
              <LineChart data={navChartData} title="NAV" color="#4ade80" />
              <PreComputedReturns schemeCode={schemeCode} />
            </div>
          )}
          
          {/* 2. SIP Calculator */}
          {activeTab === 'sip' && (
            <SipCalculator schemeCode={schemeCode} navHistory={navHistory} />
          )}

          {/* 3. Goal Planner */}
          {activeTab === 'goal' && (
            <GoalPlanner schemeCode={schemeCode} />
          )}

          {/* 4. Fund Battle (Now real) */}
          {activeTab === 'compare' && (
            <FundBattlePage defaultCode={schemeCode} /> 
            // ✅ Pass the current fund as preselected
          )}
        </div>
      </div>
    </div>
  );
}
