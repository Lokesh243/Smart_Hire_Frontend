import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" />

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />
  }

  return children
}