'use client';
import { useState, useEffect } from 'react';
import LineChart from '@/components/LineChart';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaBalanceScale, FaChartArea, FaBolt, FaTable } from 'react-icons/fa'; // ✅ added FaTable

// List of available funds (fetched once)
function useFundList() {
    const [list, setList] = useState([]);
    useEffect(() => {
        fetch('/api/mf')
            .then(res => res.json())
            .then(data => setList(data.slice(0, 500))) // Limit list size
            .catch(console.error);
    }, []);
    return list;
}

// Fetch data for multiple selected schemes
function useComparisonData(schemeCodes) {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        const codesToFetch = schemeCodes.filter(Boolean).filter((code, index, self) => self.indexOf(code) === index);
        
        if (codesToFetch.length === 0) {
            setData({});
            setLoading(false);
            return;
        }

        setLoading(true);
        const fetchPromises = codesToFetch.map(code => 
            Promise.all([
                fetch(`/api/scheme/${code}`).then(res => res.json()), 
                fetch(`/api/scheme/${code}/returns?period=1y`).then(res => res.json())
            ]).then(([details, returns]) => ({
                code,
                meta: details.meta,
                navData: details.data.slice(-252), // ~1 year
                oneYearReturn: returns.annualizedReturn
            })).catch(error => {
                console.error(`Error loading fund ${code}:`, error);
                return { code, meta: { scheme_name: `Error: Fund ${code}` }, navData: [], oneYearReturn: 'N/A' };
            })
        );

        Promise.all(fetchPromises)
            .then(results => {
                const validResults = results.filter(result => result.meta && !result.meta.scheme_name.startsWith('Error'));
                setData(validResults.reduce((acc, curr) => {
                    acc[curr.code] = curr;
                    return acc;
                }, {}));
            })
            .finally(() => setLoading(false));

    }, [schemeCodes]);

    return { data, loading };
}

export default function FundBattlePage() {
    const availableFunds = useFundList();
    const [selectedCodes, setSelectedCodes] = useState(['100033', '', '']);
    const { data: comparisonData, loading } = useComparisonData(selectedCodes);

    const colors = ['#3b82f6', '#10b981', '#ef4444'];
    const fundKeys = Object.keys(comparisonData);
    
    const handleSelectChange = (index, code) => {
        const newCodes = [...selectedCodes];
        newCodes[index] = code;
        setSelectedCodes(newCodes);
    };

    const chartDatasets = fundKeys.map((key, index) => ({
        label: comparisonData[key].meta.scheme_name,
        data: comparisonData[key].navData.map(d => d.nav),
        borderColor: colors[index],
        backgroundColor: colors[index] + '40', 
    }));

    if (availableFunds.length === 0 && !loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-sky-400 mb-2 flex items-center">
                    <FaBalanceScale className="mr-3"/> Fund Battle Comparison
                </h1>
                <p className="text-gray-400 mb-8">Select up to three schemes to compare their performance over time.</p>

                {/* Fund Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="p-4 rounded-xl shadow-lg border-l-4 border-dashed" style={{borderColor: colors[i]}}>
                            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                                Fund {i + 1} Selection 
                                <FaBolt className="ml-2" style={{color: colors[i]}}/>
                            </label>
                            <select
                                value={selectedCodes[i]}
                                onChange={(e) => handleSelectChange(i, e.target.value)}
                                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-sky-500 focus:border-sky-500 text-white transition-colors appearance-none"
                            >
                                <option value="">--- Select a Fund ---</option>
                                {availableFunds.map(fund => (
                                    <option key={fund.schemeCode} value={fund.schemeCode}>
                                        {fund.schemeName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>

                {loading && <LoadingSpinner />}

                {fundKeys.length > 0 && !loading && (
                    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl space-y-8">
                        {/* Comparison Chart */}
                        <div className="border-b border-gray-700 pb-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <FaChartArea className="mr-3 text-sky-400"/> NAV Comparison (Last 1 Year)
                            </h2>
                            <div className="h-96">
                                <LineChart 
                                    data={chartDatasets} 
                                    isComparison={true} 
                                    customLabels={comparisonData[fundKeys[0]].navData.map(d => d.date.slice(0, 5))}
                                />
                            </div>
                        </div>

                        {/* Summary Table */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <FaTable className="mr-3 text-sky-400"/> Key Metrics Summary
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-700 rounded-lg overflow-hidden shadow-xl">
                                    <thead className="bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Metric</th>
                                            {fundKeys.map((code, i) => (
                                                <th key={code} className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" 
                                                    style={{color: colors[i]}}>
                                                    {comparisonData[code].meta.scheme_name.split(' ').slice(0, 3).join(' ')}...
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                                        <CompareRow label="Fund House" data={comparisonData} keys={fundKeys} field="meta.fund_house" colors={colors} />
                                        <CompareRow label="Category" data={comparisonData} keys={fundKeys} field="meta.scheme_category" colors={colors} />
                                        <CompareRow label="1Y Annualized Return" data={comparisonData} keys={fundKeys} field="oneYearReturn" isReturn={true} colors={colors} />
                                        <CompareRow label="Latest NAV" data={comparisonData} keys={fundKeys} field="navData[last].nav" isCurrency={true} colors={colors} />
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ✅ Only one CompareRow definition
const CompareRow = ({ label, data, keys, field, isReturn = false, isCurrency = false, colors }) => {
    const getValue = (fundData) => {
        if (!fundData) return 'N/A';
        if (field === "navData[last].nav") return fundData.navData[fundData.navData.length - 1]?.nav;
        if (field === "oneYearReturn") return fundData.oneYearReturn;
        
        let value = fundData;
        field.split('.').forEach(prop => {
            if (value && Object.prototype.hasOwnProperty.call(value, prop)) {
                value = value[prop];
            } else {
                value = 'N/A';
            }
        });
        return value;
    };
    
    return (
        <tr className="hover:bg-gray-700 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{label}</td>
            {keys.map((key, i) => {
                const val = getValue(data[key]);
                let displayVal = val;
                let textColor = 'text-gray-300';
                
                if (val !== 'N/A') {
                    if (isReturn) {
                        displayVal = `${Number(val).toFixed(2)}%`;
                        textColor = val >= 0 ? 'text-green-400' : 'text-red-400';
                    } else if (isCurrency) {
                        displayVal = `₹${Number(val).toFixed(2)}`;
                    }
                }

                return (
                    <td key={key} className={`px-6 py-4 whitespace-nowrap text-center text-sm font-bold ${textColor}`}>
                        {displayVal}
                    </td>
                );
            })}
        </tr>
    );
};
