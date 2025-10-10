// components/FilterSidebar.js
export default function FilterSidebar({ 
  fundHouses, categories, selectedHouse, setSelectedHouse, selectedCategory, setSelectedCategory, searchTerm, setSearchTerm 
}) {
  const inputClasses = "w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition duration-150";

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl sticky top-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">Filter Schemes</h3>
      
      <div className="space-y-6">
        {/* Search Input */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search by Scheme Name</label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="e.g., Reliance Growth"
            className={inputClasses}
          />
        </div>

        {/* Fund House Filter */}
        <div>
          <label htmlFor="house" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fund House</label>
          <select
            id="house"
            value={selectedHouse}
            onChange={(e) => setSelectedHouse(e.target.value)}
            className={`${inputClasses} appearance-none`} // Use appearance-none for custom arrow styling if desired
          >
            {fundHouses.map(house => (
              <option key={house} value={house}>
                {house}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`${inputClasses} appearance-none`}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}