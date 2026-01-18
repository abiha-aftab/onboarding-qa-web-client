import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #61C8D0, #FFE596)' }}
    >
      <div className="text-center px-4">
        <h1
          className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-4 break-words"
          style={{ color: '#0F5E7B' }}
        >
          404
        </h1>
        <h2
          className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 break-words"
          style={{ color: '#0F5E7B' }}
        >
          Page Not Found
        </h2>
        <p
          className="text-sm sm:text-base md:text-lg mb-8 break-words"
          style={{ color: '#576472' }}
        >
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-[#0F5E7B] text-white rounded-lg font-semibold hover:bg-[#0d4d66] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
        >
          Go to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
