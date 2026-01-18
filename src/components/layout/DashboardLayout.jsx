import { useState } from 'react'
import Header from './Header'

function DashboardLayout({ sidebar, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex flex-1 relative">
        {/* Mobile sidebar overlay - using light brand colors */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden transition-opacity duration-300"
            style={{ backgroundColor: 'rgba(224, 247, 250, 0.7)' }} // Light cyan with 70% opacity
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - accessible via swipe or touch on mobile, always visible on desktop */}
        {sidebar && (
          <aside
            className={`
              fixed lg:static inset-y-0 left-0 z-50
              w-80 bg-gray-50 border-r border-gray-200 p-4 sm:p-6 overflow-y-auto
              transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
          >
            {sidebar}
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 w-full lg:w-auto">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
