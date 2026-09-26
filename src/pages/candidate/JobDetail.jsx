import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getJobById, applyToJob } from '../../services/api'
import Navbar from '../../components/Navbar'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [resumeUrl, setResumeUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    getJobById(id)
      .then(res => setJob(res.data))
      .catch(() => navigate('/candidate/jobs'))
      .finally(() => setLoading(false))
  }, [id])

  const handleApply = async () => {
    setApplying(true)
    setMessage(null)
    try {
      await applyToJob({ jobId: parseInt(id), resumeUrl })
      setMessage({ type: 'success', text: 'Application submitted successfully!' })
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to apply. You may have already applied.'
      setMessage({ type: 'error', text: msg })
    } finally {
      setApplying(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center text-gray-400 py-20">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">

        <button
          onClick={() => navigate('/candidate/jobs')}
          className="text-blue-600 hover:underline text-sm mb-6 inline-block"
        >
          ← Back to jobs
        </button>

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
              <p className="text-gray-500 mt-1">{job.location} · {job.jobType}</p>
              <p className="text-sm text-gray-400 mt-1">Posted by {job.postedByName}</p>
            </div>
            <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
              {job.status}
            </span>
          </div>

          <div className="border-t border-gray-100 pt-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Job Description</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Apply for this position</h2>

            {message && (
              <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-600'
              }`}>
                {message.text}
              </div>
            )}

            <input
              type="url"
              placeholder="Resume URL (Google Drive, LinkedIn, etc.)"
              value={resumeUrl}
              onChange={e => setResumeUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleApply}
              disabled={applying || message?.type === 'success'}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {applying ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}