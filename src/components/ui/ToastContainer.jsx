import { useSelector } from 'react-redux'
import Toast from './Toast'

function ToastContainer() {
  const toasts = useSelector((state) => state.ui.toasts)

  if (toasts.length === 0) {
    return null
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end"
      style={{ zIndex: 9999 }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

export default ToastContainer
