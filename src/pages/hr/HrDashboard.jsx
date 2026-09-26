import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getHrDashboard } from '../../services/api'
import Navbar from '../../components/Navbar'

export default function HrDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHrDashboard()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center text-gray-400 py-20">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">HR Dashboard</h1>
        <p className="text-gray-500 mb-8">Overview of your hiring activity</p>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Jobs Posted', value: data?.totalJobsPosted ?? 0, color: 'blue' },
            { label: 'Open Jobs', value: data?.openJobs ?? 0, color: 'green' },
            { label: 'Total Applicants', value: data?.totalApplicants ?? 0, color: 'purple' },
            { label: 'Closed Jobs', value: data?.closedJobs ?? 0, color: 'gray' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Pipeline funnel */}
        {data?.pipelineFunnel && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Pipeline Funnel</h2>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(data.pipelineFunnel).map(([stage, count]) => (
                <div key={stage} className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{count}</div>
                  <div className="text-xs text-gray-500 mt-1">{stage}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/hr/post-job"
            className="bg-blue-600 text-white rounded-xl p-6 hover:bg-blue-700 transition text-center">
            <p className="text-xl font-semibold">+ Post New Job</p>
            <p className="text-blue-100 text-sm mt-1">Create a new job listing</p>
          </Link>
          <Link to="/hr/jobs"
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition text-center">
            <p className="text-xl font-semibold text-gray-800">View My Jobs</p>
            <p className="text-gray-400 text-sm mt-1">Manage your postings</p>
          </Link>
        </div>
      </div>
    </div>
  )
}