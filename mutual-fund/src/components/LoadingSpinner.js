// components/LoadingSpinner.js
export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-500"></div>
      <p className="ml-4 text-xl text-gray-700 dark:text-gray-300">Loading Funds...</p>
    </div>
  );
}