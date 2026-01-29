function StatusBadge({ status, className = '' }) {
  const getStatusConfig = status => {
    const normalizedStatus = status?.toLowerCase() || 'pending'

    switch (normalizedStatus) {
      case 'in_progress':
      case 'inprogress':
        return {
          text: 'In Progress',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: '#3b82f6',
        }
      case 'pending_review':
      case 'inreview':
        return {
          text: 'In Review',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: '#eab308',
        }
      case 'completed':
        return {
          text: 'Completed',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: '#22c55e',
        }
      case 'approved':
        return {
          text: 'Approved',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: '#16a34a',
        }
      case 'rejected':
        return {
          text: 'Rejected',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: '#ef4444',
        }
      case 'pending':
      default:
        return {
          text: 'Pending',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          borderColor: '#f97316',
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span
      className={`text-xs font-semibold px-2 py-1 rounded ${config.bgColor} ${config.textColor} ${className}`}
      style={{ borderColor: config.borderColor }}
    >
      {config.text}
    </span>
  )
}
export default StatusBadge
