export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-8">
            <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg" />
            <div className="h-5 w-28 bg-gray-200 rounded" />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="h-6 w-16 bg-gray-200 rounded mb-2" />
          <div className="h-7 w-64 bg-gray-200 rounded mb-1" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-48" />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-80" />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-40" />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-32" />
          </div>
        </div>
      </main>
    </div>
  )
}
