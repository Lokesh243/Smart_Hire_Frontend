import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyJobs } from '../../services/api'
import Navbar from '../../components/Navbar'

export default function MyJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getMyJobs()
      .then(res => setJobs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Jobs</h1>
            <p className="text-gray-500 mt-1">Manage your job postings</p>
          </div>
          <button
            onClick={() => navigate('/hr/post-job')}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            + Post New Job
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            No jobs posted yet.
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{job.title}</h2>
                    <p className="text-gray-500 mt-1">{job.location} · {job.jobType}</p>
                    <p className="text-sm text-gray-400 mt-1">Expires {job.expiresAt}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                      job.status === 'OPEN'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {job.status}
                    </span>
                    <p className="text-sm text-gray-400 mt-2">
                      {job.totalApplicants} applicant{job.totalApplicants !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => navigate(`/hr/jobs/${job.id}/applicants`)}
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    View Applicants →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}