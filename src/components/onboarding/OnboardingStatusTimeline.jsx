function OnboardingStatusTimeline({ status, className = '' }) {
  // Normalize status to handle different case variations
  const normalizeStatus = status => {
    if (!status) return 'pending'
    const normalized = status.toLowerCase().trim()
    
    // Handle variations
    if (normalized === 'inprogress') return 'in_progress'
    if (normalized === 'completed' || normalized === 'COMPLETED') return 'completed'
    
    return normalized
  }

  const currentStatus = normalizeStatus(status)

  // Define statuses in order (only 3: Pending, In Progress, Completed)
  const statuses = [
    { key: 'pending', label: 'Pending', icon: 'clock' },
    { key: 'in_progress', label: 'In Progress', icon: 'spinner' },
    { key: 'completed', label: 'Completed', icon: 'check' },
  ]

  // Map current status to one of the 3 statuses
  // If status is pending_review, approved, or rejected, map to completed
  const mapToTimelineStatus = status => {
    if (status === 'pending') return 'pending'
    if (status === 'in_progress' || status === 'inprogress') return 'in_progress'
    // All other statuses (completed, pending_review, approved, rejected) map to completed
    return 'completed'
  }

  const timelineStatus = mapToTimelineStatus(currentStatus)
  const currentStatusIndex = statuses.findIndex(s => s.key === timelineStatus)
  
  // Determine status state for each step
  const getStatusState = index => {
    if (index < currentStatusIndex) return 'completed'
    if (index === currentStatusIndex) return 'active'
    return 'disabled'
  }

  // Get status configuration - only active status is highlighted, others are grey
  const getStatusConfig = (statusKey, state) => {
    // Active state - highlighted with colors based on status
    if (state === 'active') {
      switch (statusKey) {
        case 'pending':
          return {
            circleBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
            circleBorder: 'border-amber-500',
            circleShadow: 'shadow-lg shadow-amber-200',
            lineBg: 'bg-gradient-to-b from-amber-400 to-amber-500',
            textColor: 'text-amber-700',
            bgColor: 'bg-amber-50',
            pulse: true,
          }
        case 'in_progress':
          return {
            circleBg: 'bg-gradient-to-br from-blue-400 to-blue-600',
            circleBorder: 'border-blue-500',
            circleShadow: 'shadow-lg shadow-blue-200',
            lineBg: 'bg-gradient-to-b from-blue-400 to-blue-600',
            textColor: 'text-blue-700',
            bgColor: 'bg-blue-50',
            pulse: true,
          }
        case 'completed':
          return {
            circleBg: 'bg-gradient-to-br from-emerald-400 to-green-500',
            circleBorder: 'border-emerald-500',
            circleShadow: 'shadow-lg shadow-emerald-200',
            lineBg: 'bg-gradient-to-b from-emerald-400 to-emerald-500',
            textColor: 'text-emerald-700',
            bgColor: 'bg-emerald-50',
            pulse: false,
          }
        default:
          return {
            circleBg: 'bg-gradient-to-br from-gray-400 to-gray-500',
            circleBorder: 'border-gray-500',
            circleShadow: 'shadow-lg shadow-gray-200',
            lineBg: 'bg-gradient-to-b from-gray-400 to-gray-500',
            textColor: 'text-gray-700',
            bgColor: 'bg-gray-50',
            pulse: false,
          }
      }
    }

    // Completed and disabled states - both are faded grey
    return {
      circleBg: 'bg-gray-200',
      circleBorder: 'border-gray-300',
      circleShadow: '',
      lineBg: 'bg-gray-200',
      textColor: 'text-gray-400',
      bgColor: 'bg-transparent',
      pulse: false,
    }
  }

  // Get icon component
  const getStatusIcon = (iconType, state) => {
    if (state === 'completed') {
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      )
    }

    if (state === 'active') {
      if (iconType === 'clock') {
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      }
      if (iconType === 'spinner') {
        return (
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        )
      }
      return (
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="6" />
        </svg>
      )
    }

    // Disabled state
    return (
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="6" />
      </svg>
    )
  }

  return (
    <div className={`bg-white rounded-xl p-5 border border-gray-100 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-5 bg-gradient-to-b from-[#0F5E7B] to-[#0d4d66] rounded-full"></div>
        <h3 className="text-sm font-bold tracking-wide uppercase" style={{ color: '#0F5E7B' }}>
          Status Timeline
        </h3>
      </div>
      
      <div className="relative pl-1">
        {/* Vertical Timeline */}
        <div className="space-y-6">
          {statuses.map((statusItem, index) => {
            const state = getStatusState(index)
            const config = getStatusConfig(statusItem.key, state)
            const isLast = index === statuses.length - 1
            const isActive = state === 'active'
            
            return (
              <div key={statusItem.key} className="relative flex items-start group">
                {/* Timeline Line */}
                {!isLast && (
                  <div
                    className={`absolute left-4 top-8 w-0.5 transition-all duration-300 ${
                      state === 'active' ? config.lineBg : 'bg-gray-200'
                    }`}
                    style={{ height: 'calc(100% + 0.5rem)' }}
                  />
                )}
                
                {/* Status Circle with professional styling */}
                <div className="relative z-10">
                  <div
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-full border-2
                      ${config.circleBg} ${config.circleBorder} ${config.circleShadow}
                      transition-all duration-300 transform
                      ${isActive ? 'scale-110' : 'scale-100'}
                      ${!isActive ? 'opacity-50' : 'opacity-100'}
                    `}
                  >
                    {config.pulse && (
                      <span className="absolute inset-0 rounded-full bg-current animate-ping opacity-20"></span>
                    )}
                    <span className={`relative ${isActive ? 'text-white' : 'text-gray-400'}`}>
                      {getStatusIcon(statusItem.icon, state)}
                    </span>
                  </div>
                </div>
                
                {/* Status Label with background */}
                <div className="ml-4 flex-1 pt-1">
                  <div className={`
                    inline-block px-3 py-1.5 rounded-lg transition-all duration-300
                    ${config.bgColor} ${config.textColor}
                    ${isActive ? 'font-semibold shadow-sm' : 'font-medium'}
                  `}>
                    <p className={`text-xs tracking-wide ${config.textColor}`}>
                      {statusItem.label}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default OnboardingStatusTimeline

