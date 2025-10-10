'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import FundCard from '../../components/FundCard.js';
import FilterSidebar from '../../components/FilterSidebar.js';
import LoadingSpinner from '../../components/LoadingSpinner.js';

export default function FundsPage() {
  const [schemes, setSchemes] = useState([]);      // Schemes for current page
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHouse, setSelectedHouse] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const schemesPerPage = 30;

  const [totalSchemes, setTotalSchemes] = useState([]); // all schemes for filtering metadata

  // Fetch all schemes once (for filters)
  useEffect(() => {
    async function fetchAllSchemes() {
      try {
        const response = await fetch('/api/mf');
        if (!response.ok) throw new Error('Failed to fetch schemes');
        const data = await response.json();
        setTotalSchemes(data);
      } catch (error) {
        console.error("Error fetching all schemes:", error);
      }
    }
    fetchAllSchemes();
  }, []);

  // Fetch schemes for current page with returns
  useEffect(() => {
    async function fetchSchemesForPage() {
      setLoading(true);
      try {
        // Apply search/filters to totalSchemes first
        const filtered = totalSchemes.filter(scheme => {
          const matchesSearch = scheme.schemeName.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesHouse = selectedHouse === 'All' || scheme.fund_house === selectedHouse;
          const matchesCategory = selectedCategory === 'All' || scheme.scheme_category === selectedCategory;
          return matchesSearch && matchesHouse && matchesCategory;
        });

        const start = (currentPage - 1) * schemesPerPage;
        const end = start + schemesPerPage;
        const pageSchemes = filtered.slice(start, end);

        // Fetch 1-year returns for only these schemes
        const schemesWithReturns = await Promise.all(
          pageSchemes.map(async (scheme) => {
            try {
              const returnsResponse = await fetch(`/api/scheme/${scheme.schemeCode}/returns?period=1y`);
              if (returnsResponse.ok) {
                const returnsData = await returnsResponse.json();
                return { ...scheme, oneYearReturn: returnsData.annualizedReturn };
              }
              return { ...scheme, oneYearReturn: null };
            } catch {
              return { ...scheme, oneYearReturn: null };
            }
          })
        );

        setSchemes(schemesWithReturns);

      } catch (error) {
        console.error("Error fetching schemes for page:", error);
      } finally {
        setLoading(false);
      }
    }

    if (totalSchemes.length > 0) {
      fetchSchemesForPage();
    }
  }, [totalSchemes, searchTerm, selectedHouse, selectedCategory, currentPage]);

  // Memoize filters metadata
  const { fundHouses, categories, filteredSchemesCount } = useMemo(() => {
    const uniqueHouses = new Set(['All']);
    const uniqueCategories = new Set(['All']);
    totalSchemes.forEach(scheme => {
      uniqueHouses.add(scheme.fund_house || 'Unknown');
      uniqueCategories.add(scheme.scheme_category || 'Other');
    });

    // Count filtered schemes for pagination
    const filteredSchemes = totalSchemes.filter(scheme => {
      const matchesSearch = scheme.schemeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesHouse = selectedHouse === 'All' || scheme.fund_house === selectedHouse;
      const matchesCategory = selectedCategory === 'All' || scheme.scheme_category === selectedCategory;
      return matchesSearch && matchesHouse && matchesCategory;
    });

    return {
      fundHouses: Array.from(uniqueHouses).sort(),
      categories: Array.from(uniqueCategories).sort(),
      filteredSchemesCount: filteredSchemes.length
    };
  }, [totalSchemes, searchTerm, selectedHouse, selectedCategory]);

  const totalPages = Math.ceil(filteredSchemesCount / schemesPerPage);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
          MF <span className="text-sky-500">Analytics</span> Screener
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Explore and analyze mutual fund schemes in the market.
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <div className="lg:w-1/4">
            <FilterSidebar
              fundHouses={fundHouses}
              categories={categories}
              selectedHouse={selectedHouse}
              setSelectedHouse={setSelectedHouse}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>

          {/* Fund Cards Grid */}
          <div className="lg:w-3/4">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
              Showing {filteredSchemesCount} Schemes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {schemes.map(scheme => (
                <Link key={scheme.schemeCode} href={`/scheme/${scheme.schemeCode}`}>
                  <FundCard scheme={scheme} />
                </Link>
              ))}
            </div>

            {/* Pagination Buttons */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === i + 1
                        ? 'bg-sky-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
