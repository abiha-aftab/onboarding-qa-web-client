import StatusBadge from '../ui/StatusBadge'

function OnboardingCard({ onboarding, isActive, onSelect, onDeselect, disabled }) {
  // Determine current step for highlighting
  const currentStep =
    onboarding.status === 'in_progress' || onboarding.status === 'inprogress'
      ? (onboarding.completed_steps || 0) + 1
      : onboarding.status === 'pending_review'
        ? onboarding.completed_steps || onboarding.total_steps || 3
        : 1
  const totalSteps = onboarding.total_steps || 3

  const borderColor = isActive ? '#0F5E7B' : getStatusColor(onboarding.status)

  function getStatusColor(status) {
    if (status === 'in_progress' || status === 'inprogress') return '#3b82f6'
    if (status === 'pending_review') return '#eab308'
    return '#f97316'
  }

  const handleClick = () => {
    if (disabled) return

    if (isActive) {
      onDeselect()
    } else {
      onSelect()
    }
  }

  return (
    <div
      className={`bg-white border-2 rounded-lg p-3 sm:p-4 shadow-sm transition-all cursor-pointer ${
        isActive ? 'ring-2 ring-offset-2' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{
        borderColor,
        ringColor: isActive ? '#0F5E7B' : 'transparent',
      }}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
              isActive ? 'bg-[#0F5E7B]' : 'bg-orange-500'
            }`}
          >
            {onboarding.id}
          </div>
          <span className="font-medium text-xs sm:text-sm truncate" style={{ color: '#0F5E7B' }}>
            {onboarding.onboarding_title}
          </span>
        </div>
        <div className="flex-shrink-0">
          <StatusBadge status={onboarding.status} />
        </div>
      </div>

      {/* Step indicator */}
      {(onboarding.status === 'in_progress' ||
        onboarding.status === 'inprogress' ||
        onboarding.status === 'pending_review') && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }, (_, i) => {
              const stepNum = i + 1
              const isCompleted = stepNum <= (onboarding.completed_steps || 0)
              const isCurrent = stepNum === currentStep && !isCompleted

              return (
                <div
                  key={stepNum}
                  className={`flex-1 h-2 rounded ${
                    isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                  title={`Step ${stepNum}${isCompleted ? ' (Completed)' : isCurrent ? ' (Current)' : ''}`}
                />
              )
            })}
          </div>
          <div className="text-xs mt-1" style={{ color: '#576472' }}>
            Step {currentStep} of {totalSteps}
          </div>
        </div>
      )}
    </div>
  )
}

export default OnboardingCard
