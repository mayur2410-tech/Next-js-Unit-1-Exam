'use client';
import { useState, useEffect } from 'react';
import { FaBrain } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function AiSummary({ schemeMeta }) {
  const [summary, setSummary] = useState(null);          // Verdict + justification
  const [projectionData, setProjectionData] = useState(null); // Projection table + chart
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingProjection, setLoadingProjection] = useState(false);
  const [investment, setInvestment] = useState("");      // User input for initial investment

  // Fetch verdict + justification on component load
  useEffect(() => {
    async function fetchSummary() {
      setLoadingSummary(true);
      try {
        const response = await fetch('/api/ai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contextData: {
              fundHouse: schemeMeta.fund_house,
              category: schemeMeta.scheme_category,
              cagr5y: '18.5%',
            },
            prompt: `Provide only verdict, justification, and disclaimer in JSON. Do NOT include projections.`
          }),
        });
        const result = await response.json();
        setSummary(result);
      } catch (e) {
        setSummary({ error: 'AI analysis unavailable' });
      } finally {
        setLoadingSummary(false);
      }
    }
    fetchSummary();
  }, [schemeMeta]);

  // Fetch projection only when user clicks button
  const fetchProjection = async () => {
    if (!investment || isNaN(investment) || investment <= 0) return;

    setLoadingProjection(true);
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contextData: {
            fundHouse: schemeMeta.fund_house,
            category: schemeMeta.scheme_category,
            cagr5y: '18.5%',
          },
          initialInvestment: Number(investment),
          prompt: `Provide verdict, justification, disclaimer, AND projections for 1,3,5,10 years in JSON.`
        }),
      });
      const result = await response.json();
      setProjectionData(result);
    } catch (e) {
      setProjectionData({ error: 'Projection unavailable' });
    } finally {
      setLoadingProjection(false);
    }
  };

  if (loadingSummary) {
    return (
      <div className="bg-gray-800 p-5 rounded-xl shadow-2xl md:col-span-3 border-l-4 border-purple-500">
        <h3 className="font-bold text-purple-400 flex items-center mb-2">
          <FaBrain className="mr-2"/> AI Investment Insight
        </h3>
        <p className="text-gray-300 italic text-sm">Analyzing data...</p>
      </div>
    );
  }

  if (!summary || summary.error) {
    return <p className="text-red-400">AI analysis failed. Please try again later.</p>;
  }

  const chartData = projectionData?.projection
    ? {
        labels: projectionData.projection.map(p => `${p.year} yr`),
        datasets: [
          {
            label: 'Investment Value',
            data: projectionData.projection.map(p => p.value),
            borderColor: '#a855f7',
            backgroundColor: 'rgba(168,85,247,0.3)',
          }
        ]
      }
    : null;

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-2xl md:col-span-3 border-l-4 border-purple-500">
      <h3 className="font-bold text-purple-400 flex items-center mb-2">
        <FaBrain className="mr-2"/> AI Investment Insight
      </h3>

      {/* Step 1: Verdict + Justification */}
      <p className="text-gray-200 font-bold">{summary.verdict}</p>
      <p className="text-gray-300 italic">{summary.justification}</p>
      <p className="text-gray-400 text-xs mt-1">{summary.disclaimer}</p>

      {/* Step 2: User input for initial investment */}
      <div className="mt-4 mb-2">
        <label className="text-gray-300 text-sm mr-2">Enter Initial Investment:</label>
        <input
          type="number"
          value={investment}
          onChange={(e) => setInvestment(e.target.value)}
          className="p-1 rounded text-black w-24"
        />
        <button
          onClick={fetchProjection}
          className="ml-2 px-2 py-1 bg-purple-600 text-white rounded"
        >
          Show Projection
        </button>
      </div>

      {/* Step 3: Projection Table + Chart */}
      {loadingProjection && <p className="text-gray-300 text-sm">Calculating projections...</p>}

      {projectionData?.projection && !loadingProjection && (
        <>
          <table className="mt-4 w-full text-sm text-left text-gray-300 border border-gray-600">
            <thead className="bg-gray-700 text-gray-200">
              <tr>
                <th className="px-3 py-2">Year</th>
                <th className="px-3 py-2">Projected Value</th>
              </tr>
            </thead>
            <tbody>
              {projectionData.projection.map(p => (
                <tr key={p.year} className="border-t border-gray-600">
                  <td className="px-3 py-2">{p.year}</td>
                  <td className="px-3 py-2">₹{p.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4">
            <Line data={chartData} />
          </div>
        </>
      )}
    </div>
  );
}
