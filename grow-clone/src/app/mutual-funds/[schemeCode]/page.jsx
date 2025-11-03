// app/mutualfunds/[schemeCode]/page.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Search, ChevronDown, Loader2, SearchIcon, TrendingUp, Share2, Bookmark } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Navbar from "../../../../components/Navbar";
import Fundcalculators from '../../../components/Fundcalculators'

// -------------------- Helpers --------------------
const useSchemeCode = () => {
  const path = window.location.pathname;
  const parts = path.split("/");
  if (parts.length > 2) return parts[parts.length - 1];
  return "118535"; // default scheme code
};

const navigate = (path) => {
  window.location.hash = path;
  window.location.pathname = path;
};

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const formatCrore = (amount) =>
  new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + " Cr";

// Helper function to parse date string to Date object
const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Helper function to calculate exact date difference
const getExactDateDiff = (date, years = 0, months = 0) => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() - years);
  result.setMonth(result.getMonth() - months);
  
  // If the day of month has changed (e.g., Jan 31 -> Feb 28), adjust to last day of previous month
  if (date.getDate() !== result.getDate()) {
    result.setDate(0); // Sets to last day of previous month
  }
  
  return result;
};

// Slice historical NAVs according to period
const getPeriodStartNav = (historicalNavs, period) => {
  if (!historicalNavs || historicalNavs.length === 0) return null;
  
  // For ALL period, return the oldest NAV that has a valid date
  if (period === "ALL") {
    // Find the first NAV with a valid date (in case there are any invalid entries at the end)
    for (let i = historicalNavs.length - 1; i >= 0; i--) {
      if (historicalNavs[i]?.date) {
        return historicalNavs[i];
      }
    }
    return historicalNavs[historicalNavs.length - 1]; // fallback
  }

  // Get the latest NAV date
  const latestNav = historicalNavs[0];
  if (!latestNav?.date) return null;
  
  const latestDate = parseDate(latestNav.date);
  let targetDate;
  
  // Calculate target date based on period with more precise date math
  switch (period) {
    case "1M":
      targetDate = getExactDateDiff(latestDate, 0, 1);
      break;
    case "6M":
      targetDate = getExactDateDiff(latestDate, 0, 6);
      break;
    case "1Y":
      targetDate = getExactDateDiff(latestDate, 1, 0);
      break;
    case "3Y":
      targetDate = getExactDateDiff(latestDate, 3, 0);
      break;
    case "5Y":
      targetDate = getExactDateDiff(latestDate, 5, 0);
      break;
    default:
      return latestNav;
  }

  // Find the NAV with date closest to targetDate
  let closestNav = historicalNavs[0]; // default to latest NAV
  let minDiff = Math.abs(parseDate(closestNav.date) - targetDate);
  
  for (let i = 1; i < historicalNavs.length; i++) {
    if (!historicalNavs[i]?.date) continue;
    
    const navDate = parseDate(historicalNavs[i].date);
    const diff = Math.abs(navDate - targetDate);
    
    // If we find a NAV that's before or equal to target date and closer than current best
    if (navDate <= targetDate && diff < minDiff) {
      minDiff = diff;
      closestNav = historicalNavs[i];
    }
    
    // Early exit if we've gone too far back in time
    if (navDate < targetDate && minDiff < Infinity) {
      break;
    }
  }

  return closestNav;
};

// Prepare chart data
const generateChartData = (historicalNavs, period) => {
  if (!historicalNavs || historicalNavs.length === 0) return [];
  let days;
  switch (period) {
    case "1M":
      days = 30;
      break;
    case "6M":
      days = 180;
      break;
    case "1Y":
      days = 365;
      break;
    case "3Y":
      days = 1095;
      break;
    case "5Y":
      days = 1825;
      break;
    case "ALL":
      days = historicalNavs.length;
      break;
    default:
      days = 30;
  }

  const sliced = historicalNavs.slice(0, days).reverse();
  return sliced.map((item) => ({
    date: new Date(item.date.split("-").reverse().join("-")).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    nav: parseFloat(item.nav),
  }));
};

// -------------------- Navbar --------------------


// -------------------- Page Wrapper --------------------
const PageWrapper = ({ children }) => (
  <div className="min-h-screen bg-gray-50 font-sans">
    <Navbar />
    <div className="container mx-auto px-4 py-8 md:py-12">{children}</div>
  </div>
);

// -------------------- Tooltip --------------------
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const navValue = payload[0].value;
    const isPositive = navValue > 15;
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg text-sm">
        <p className="text-gray-500 text-xs mb-1">{label}</p>
        <p className="font-bold text-lg" style={{ color: isPositive ? "#10B981" : "#EF4444" }}>
          {formatINR(navValue)}
        </p>
      </div>
    );
  }
  return null;
};

// -------------------- Fund Details Page --------------------
const FundDetailsPage = () => {
  const schemeCode = useSchemeCode();
  const [fundData, setFundData] = useState(null);
  const [historicalNavs, setHistoricalNavs] = useState([]);
  const [activePeriod, setActivePeriod] = useState("3Y");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from mfapi.in
  useEffect(() => {
    if (!schemeCode) {
      setError("No Scheme Code provided in URL.");
      setIsLoading(false);
      return;
    }

    const fetchFund = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`https://api.mfapi.in/mf/${schemeCode}`);
        const data = res.data;
        if (data && data.meta && data.data) {
          setFundData(data.meta);
          setHistoricalNavs(data.data);
        } else {
          setError("Fund data not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch fund data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFund();
  }, [schemeCode]);

  // Chart data for active period
  const chartData = useMemo(() => generateChartData(historicalNavs, activePeriod), [historicalNavs, activePeriod]);

  // Latest NAV and historical calculations
  const latestNavObj = historicalNavs.length > 0 ? historicalNavs[0] : null;
  const latestNav = latestNavObj ? parseFloat(latestNavObj.nav) : 0;
  const navDate = latestNavObj ? latestNavObj.date : "";
  
  // Calculate highest and lowest NAV from historical data
  const navValues = historicalNavs.map(item => parseFloat(item.nav));
  const highestNav = navValues.length > 0 ? Math.max(...navValues) : 0;
  const lowestNav = navValues.length > 0 ? Math.min(...navValues) : 0;
  
  // Get fund start date (oldest date in historical data)
  const fundStartDate = historicalNavs.length > 0 ? historicalNavs[historicalNavs.length - 1].date : "";

  // 1D Return (last available day vs previous available day)
  const prevNavObj = historicalNavs.length > 1 ? historicalNavs[1] : latestNavObj;
  const return1D = prevNavObj ? ((latestNav - parseFloat(prevNavObj.nav)) / parseFloat(prevNavObj.nav)) * 100 : 0;
  const isPositive1D = return1D >= 0;

  // Period Return
  const periodStartNavObj = getPeriodStartNav(historicalNavs, activePeriod);
  const periodReturn = periodStartNavObj ? ((latestNav - parseFloat(periodStartNavObj.nav)) / parseFloat(periodStartNavObj.nav)) * 100 : 0;
  const isPositiveReturn = periodReturn >= 0;

  if (isLoading)
    return (
      <PageWrapper>
        <div className="p-16 text-center text-gray-500 bg-white rounded-xl shadow-lg">
          <Loader2 className="w-10 h-10 text-[#00D09C] animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Loading details for Scheme {schemeCode}...</p>
        </div>
      </PageWrapper>
    );

  if (error || !fundData)
    return (
      <PageWrapper>
        <div className="p-16 text-center text-red-600 bg-white rounded-xl shadow-lg border border-red-300">
          <p className="text-xl font-semibold mb-2">Error Loading Fund</p>
          <p className="text-sm">{error}</p>
          <button
            className="mt-4 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition"
            onClick={() => navigate("/mutualfunds")}
          >
            Go back to fund list
          </button>
        </div>
      </PageWrapper>
    );

  const fundName = fundData.scheme_name;

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        {/* Fund Header */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-red-500" />
                {/* <Image src="/mutual-fund-icon.png" alt="Fund Icon" width={24} height={24} /> */}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 leading-snug">{fundName}</h1>
                <p className="text-sm text-gray-500 mt-1">{fundData.fund_house} | {fundData.scheme_type}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="text-gray-400 hover:text-[#00D09C] transition">
                <Bookmark className="w-6 h-6" />
              </button>
              <button className="text-gray-400 hover:text-[#00D09C] transition">
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-4xl font-extrabold" style={{ color: isPositiveReturn ? "#10B981" : "#EF4444" }}>
              {isPositiveReturn ? "+" : ""}{periodReturn.toFixed(2)}%
            </p>
            <p className="text-sm text-gray-500 mt-1">{activePeriod} Return</p>
            <p className={`text-sm mt-0.5 ${isPositive1D ? "text-green-600" : "text-red-600"}`}>
              {isPositive1D ? "+" : ""}{return1D.toFixed(2)}% 1D
            </p>
          </div>

          <div className="relative h-96 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={60} style={{ fontSize: "10px" }} />
                  <YAxis type="number" domain={["auto", "auto"]} tickFormatter={(v) => formatINR(v).replace("₹", "")} tickLine={false} axisLine={false} style={{ fontSize: "10px" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="nav" stroke="#00D09C" strokeWidth={2} dot={false} activeDot={{ r: 6, fill: "#00D09C", stroke: "white", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400">No NAV data available for chart.</div>
            )}
          </div>

          <div className="flex justify-center space-x-4 mt-4">
            {["1M", "6M", "1Y", "3Y", "5Y", "ALL"].map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-150 ${
                  activePeriod === period ? "bg-[#00D09C] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <div className="mt-8 text-sm text-gray-500 border-t pt-4">
            <p>Disclaimer: Past performance is not indicative of future results.</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Key Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col">
              <p className="text-xs text-gray-500">NAV ({navDate})</p>
              <p className="text-lg font-bold text-gray-800 mt-1">{formatINR(latestNav)}</p>
            </div>
            <div className="flex flex-col border-l border-gray-200 pl-4">
              <p className="text-xs text-gray-500">Highest NAV</p>
              <p className="text-lg font-bold text-gray-800 mt-1">{highestNav > 0 ? formatINR(highestNav) : "-"}</p>
            </div>
            <div className="flex flex-col border-l border-gray-200 pl-4">
              <p className="text-xs text-gray-500">Lowest NAV</p>
              <p className="text-lg font-bold text-gray-800 mt-1">{lowestNav > 0 ? formatINR(lowestNav) : "-"}</p>
            </div>
            <div className="flex flex-col border-l border-gray-200 pl-4">
              <p className="text-xs text-gray-500">Fund Start Date</p>
              <p className="text-lg font-bold text-gray-800 mt-1">{fundStartDate || "-"}</p>
            </div>
          
          </div>
        </div>
        {/* Fund Calculators */}
      <Fundcalculators historicalNavs={historicalNavs} fundData={fundData} />

      </div>
    </PageWrapper>
  );
};

export default FundDetailsPage;
