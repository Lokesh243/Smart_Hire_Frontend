import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login, getMe } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

 const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError('')
  try {
    // Clear old token first
    localStorage.removeItem('token')

    const res = await login(form)
    const token = res.data.accessToken

    // Set token before calling getMe
    localStorage.setItem('token', token)

    const meRes = await getMe()
    loginUser(token, meRes.data)

    const role = meRes.data.role
    if (role === 'HR') navigate('/hr/dashboard')
    else if (role === 'ADMIN') navigate('/admin/dashboard')
    else navigate('/candidate/jobs')
  } catch (err) {
    localStorage.removeItem('token')
    setError('Invalid email or password')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">

        <h1 className="text-3xl font-bold text-blue-700 text-center mb-2">
          SmartHire
        </h1>
        <p className="text-center text-gray-500 mb-6">Sign in to your account</p>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}