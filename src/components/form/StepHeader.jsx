function StepHeader({ title, currentStepOrder, totalSteps }) {
  return (
    <div className="mb-4 sm:mb-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 break-words" style={{ color: '#0F5E7B' }}>
        {title}
      </h2>
      <p className="text-xs sm:text-sm" style={{ color: '#576472' }}>
        Step {currentStepOrder} of {totalSteps}
      </p>
    </div>
  )
}

export default StepHeader
