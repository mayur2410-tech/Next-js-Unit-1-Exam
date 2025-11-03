// app/calculators/sip/page.jsx
"use client";
import React, { useState, useMemo } from 'react';
import Navbar from '../../../../components/Navbar';

/** Helper: Format number as INR */
const formatINR = (amount) => {
    if (amount === null || isNaN(amount)) return '₹ 0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount).replace('₹', '₹ ');
};

/** SIP Calculation Formula */
const calculateSIP = (monthlyInvestment, annualRate, years) => {
    if (monthlyInvestment <= 0 || annualRate <= 0 || years <= 0) {
        return { totalInvested: 0, estimatedReturns: 0, totalValue: 0 };
    }

    const r = (annualRate / 100) / 12;
    const n = years * 12;

    const fv = monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const totalInvested = monthlyInvestment * n;
    const estimatedReturns = fv - totalInvested;

    return {
        totalInvested: Math.round(totalInvested),
        estimatedReturns: Math.round(estimatedReturns),
        totalValue: Math.round(fv),
    };
};

/** Custom Input with Range Slider (type-in friendly) */
const CustomRangeInput = ({ label, value, unit, min, max, step, onChange }) => {
    const [localValue, setLocalValue] = useState(value);

    // update local input & propagate to parent
    const handleTextChange = (e) => {
        const val = e.target.value.replace(/[^\d.]/g, '');
        setLocalValue(val);
        if (!isNaN(val) && val !== '') {
            onChange(Number(val));
        }
    };

    // sync local value when props change
    React.useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="mb-6">
            <div className="flex justify-between items-baseline mb-2 text-sm md:text-base">
                <label className="text-gray-600">{label}</label>
                <div className="flex items-center">
                    {unit === '₹' && <span className="mr-1 text-gray-500">₹</span>}
                    <input
                        type="text"
                        value={localValue}
                        onChange={handleTextChange}
                        className="w-28 text-right border border-gray-200 rounded-md px-2 py-1 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00D09C] transition-all duration-150"
                    />
                    {unit !== '₹' && <span className="ml-1 text-gray-500">{unit}</span>}
                </div>
            </div>

            {/* Smooth range - reflects typed value */}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={Math.min(Math.max(value, min), max)} // prevent overflow visually
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer transition-all duration-300 ease-out"
                style={{
                    background: `linear-gradient(to right, #00D09C 0%, #00D09C ${percentage}%, #E0E0E0 ${percentage}%, #E0E0E0 100%)`,
                }}
            />

            <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{unit === '₹' ? formatINR(min) : `${min} ${unit}`}</span>
                <span>{unit === '₹' ? formatINR(max) : `${max} ${unit}`}</span>
            </div>
        </div>
    );
};

/** Main SIP Calculator Component */
const SIPCalculator = () => {
    const [monthlyInvestment, setMonthlyInvestment] = useState(25000);
    const [annualRate, setAnnualRate] = useState(12);
    const [timePeriod, setTimePeriod] = useState(10);

    const results = useMemo(() => {
        return calculateSIP(monthlyInvestment, annualRate, timePeriod);
    }, [monthlyInvestment, annualRate, timePeriod]);

    const { totalInvested, estimatedReturns, totalValue } = results;

    const investedPercent = (totalInvested / totalValue) * 100;
    const returnsPercent = 100 - investedPercent;

    // Thicker ring chart
    const doughnutStyle = {
        background: `conic-gradient(#00D09C ${returnsPercent}%, #5C6BC0 0%)`,
        maskImage: 'radial-gradient(circle at center, transparent 50%, black 50%)',
        WebkitMaskImage: 'radial-gradient(circle at center, transparent 50%, black 50%)',
    };

    const PageWrapper = ({ children }) => (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            {children}
        </div>
    );

    return (
        <PageWrapper>
            <main className="container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-xl border border-gray-100">
                    {/* Header */}
                    <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
                        SIP Calculator
                    </h1>

                    {/* Inputs & Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Inputs */}
                        <div className="lg:col-span-2 space-y-8">
                            <CustomRangeInput
                                label="Monthly investment"
                                value={monthlyInvestment}
                                unit="₹"
                                min={500}
                                max={200000}
                                step={100}
                                onChange={setMonthlyInvestment}
                            />
                            <CustomRangeInput
                                label="Expected return rate (p.a)"
                                value={annualRate}
                                unit="%"
                                min={1}
                                max={40}
                                step={0.1}
                                onChange={setAnnualRate}
                            />
                            <CustomRangeInput
                                label="Time period"
                                value={timePeriod}
                                unit="Yr"
                                min={1}
                                max={60}
                                step={1}
                                onChange={setTimePeriod}
                            />
                        </div>

                        {/* Chart */}
                        <div className="lg:col-span-1 flex flex-col items-center justify-start pt-4">
                            <div className="relative w-52 h-52 mb-4">
                                <div
                                    className="w-full h-full rounded-full"
                                    style={doughnutStyle}
                                ></div>
                                <div className="absolute inset-0 flex items-center justify-center text-center text-sm font-semibold text-gray-700">
                                    {timePeriod} Years
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex space-x-4 text-xs font-semibold mb-6">
                                <div className="flex items-center">
                                    <span className="w-3 h-3 rounded-full bg-[#5C6BC0] mr-1"></span>
                                    Invested
                                </div>
                                <div className="flex items-center">
                                    <span className="w-3 h-3 rounded-full bg-[#00D09C] mr-1"></span>
                                    Returns
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 items-center">
                        <div className="md:col-span-2 space-y-3 mb-6 md:mb-0">
                            <div className="flex justify-between items-center text-base">
                                <p className="text-gray-600">Invested amount</p>
                                <p className="font-semibold text-gray-800">{formatINR(totalInvested)}</p>
                            </div>
                            <div className="flex justify-between items-center text-base">
                                <p className="text-gray-600">Est. returns</p>
                                <p className="font-semibold text-[#00D09C]">{formatINR(estimatedReturns)}</p>
                            </div>
                            <div className="flex justify-between items-center text-xl font-bold pt-2 border-t border-dashed border-gray-200">
                                <p className="text-gray-800">Total value</p>
                                <p className="text-gray-900">{formatINR(totalValue)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </PageWrapper>
    );
};

export default SIPCalculator;
