import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  const getDashboardLink = () => {
    if (user?.role === 'HR') return '/hr/dashboard'
    if (user?.role === 'ADMIN') return '/admin/dashboard'
    return '/candidate/jobs'
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to={getDashboardLink()} className="text-2xl font-bold text-blue-700">
          SmartHire
        </Link>

        <div className="flex items-center gap-6">
          {user?.role === 'CANDIDATE' && (
            <>
              <Link to="/candidate/jobs" className="text-gray-600 hover:text-blue-600 font-medium">
                Browse Jobs
              </Link>
              <Link to="/candidate/applications" className="text-gray-600 hover:text-blue-600 font-medium">
                My Applications
              </Link>
            </>
          )}

          {user?.role === 'HR' && (
            <>
              <Link to="/hr/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">
                Dashboard
              </Link>
              <Link to="/hr/jobs" className="text-gray-600 hover:text-blue-600 font-medium">
                My Jobs
              </Link>
              <Link to="/hr/post-job" className="text-gray-600 hover:text-blue-600 font-medium">
                Post Job
              </Link>
            </>
          )}

          {user?.role === 'ADMIN' && (
            <Link to="/admin/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">
              Dashboard
            </Link>
          )}

          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
            <span className="text-sm text-gray-500">{user?.fullName}</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              user?.role === 'HR' ? 'bg-green-100 text-green-700' :
              user?.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {user?.role}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-600 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}