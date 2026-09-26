import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createJob } from '../../services/api'
import Navbar from '../../components/Navbar'
import axios from 'axios'

export default function PostJob() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', location: '',
    jobType: 'Full-time', expiresAt: ''
  })
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  // ── AI generate description ──────────────────────────────────────
  const handleGenerateDescription = async () => {
    if (!form.title || !form.location || !form.jobType) {
      setError('Please fill in Title, Location and Job Type first')
      return
    }
    setGenerating(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(
        'http://localhost:8080/api/v1/ai/generate-job-description',
        { title: form.title, location: form.location, jobType: form.jobType },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setForm({ ...form, description: res.data.description })
    } catch (err) {
      setError('AI generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  // ── Submit job ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createJob(form)
      navigate('/hr/jobs')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/hr/jobs')}
          className="text-blue-600 hover:underline text-sm mb-6 inline-block">
          ← Back to jobs
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">Post a New Job</h1>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <input
              type="text" required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Java Backend Developer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text" required
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Hyderabad"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Type
              </label>
              <select
                value={form.jobType}
                onChange={e => setForm({ ...form, jobType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Remote</option>
                <option>Internship</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={generating}
                className="flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition disabled:opacity-50 font-medium"
              >
                {generating ? (
                  <>
                    <span className="animate-spin">⟳</span>
                    Generating...
                  </>
                ) : (
                  <>
                    ✨ Generate with AI
                  </>
                )}
              </button>
            </div>
            <textarea
              required rows={10}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Describe the role... or click '✨ Generate with AI' above"
            />
            {form.description && (
              <p className="text-xs text-gray-400 mt-1">
                ✅ AI generated — you can edit this before posting
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="date" required
              value={form.expiresAt}
              onChange={e => setForm({ ...form, expiresAt: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  )
}