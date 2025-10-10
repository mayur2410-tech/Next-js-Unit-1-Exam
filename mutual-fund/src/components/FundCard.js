// components/FundCard.js

// Placeholder function to simulate return calculation for Heatmap color
const getReturnColor = (returnPercentage) => {
  if (returnPercentage >= 15) return 'border-green-500'; // Strong Green
  if (returnPercentage >= 5) return 'border-yellow-500'; // Moderate Yellow
  if (returnPercentage > 0) return 'border-orange-500'; // Low Orange
  return 'border-red-500'; // Negative Red
};


export default function FundCard({ scheme }) {
  // NOTE: In a real implementation, 'oneYearReturn' would be fetched 
  // and passed down, likely by fetching /api/scheme/:code/returns 
  // for a pre-computed 1y value during the initial scheme data load.
  // For now, we'll use a placeholder value for dynamic styling.
  const PLACEHOLDER_RETURN = (scheme.schemeCode % 25) + 5; // Generates a number between 5 and 29

  const colorClass = getReturnColor(PLACEHOLDER_RETURN);

  return (
    <div 
      className={`relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:scale-[1.02] cursor-pointer 
      border-l-8 ${colorClass} group`}
    >
      <div className="flex justify-between items-start mb-3">
        {/* Scheme Name */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-snug group-hover:text-sky-500 transition-colors">
          {scheme.schemeName}
        </h3>
      </div>
      
      {/* Metadata Badges */}
      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
        <p>
          <span className="font-semibold text-gray-800 dark:text-gray-100">House:</span> {scheme.fund_house || 'N/A'}
        </p>
        <p>
          <span className="font-semibold text-gray-800 dark:text-gray-100">Category:</span> 
          <span className="ml-1 inline-flex items-center rounded-full bg-sky-100 dark:bg-sky-900 px-2.5 py-0.5 text-xs font-medium text-sky-800 dark:text-sky-300">
            {scheme.scheme_category || 'N/A'}
          </span>
        </p>
      </div>

      {/* Placeholder for Dynamic Return/Sparkline */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">1 Year Return (Placeholder)</p>
        <p className={`text-2xl font-extrabold ${PLACEHOLDER_RETURN > 0 ? 'text-green-600' : 'text-red-600'} dark:text-opacity-80`}>
          {PLACEHOLDER_RETURN.toFixed(2)}%
        </p>
        {/* Sparkline chart would go here */}
      </div>

      <span className="absolute top-0 right-0 m-4 text-xs font-semibold text-gray-400 dark:text-gray-500">
        #{scheme.schemeCode}
      </span>
    </div>
  );
}