import Link from 'next/link'
import { Shield, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <Shield className="h-24 w-24 text-red-500" />
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold neon-glow mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved to another location.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="neon-button px-6 py-3 rounded-md flex items-center justify-center space-x-2"
          >
            <Home className="h-5 w-5" />
            <span>Go Home</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="bg-dark-800 text-white px-6 py-3 rounded-md border border-gray-600 hover:border-red-500 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Go Back</span>
          </button>
        </div>
        
        <div className="mt-12 text-gray-500 text-sm">
          <p>If you believe this is an error, please contact support.</p>
        </div>
      </div>
    </div>
  )
} 