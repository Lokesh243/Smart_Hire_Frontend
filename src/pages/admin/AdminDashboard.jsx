import { useState, useEffect } from 'react'
import { getAdminDashboard } from '../../services/api'
import Navbar from '../../components/Navbar'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminDashboard()
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

  const stats = [
    { label: 'Total Users', value: data?.totalUsers ?? 0 },
    { label: 'Candidates', value: data?.totalCandidates ?? 0 },
    { label: 'HR Managers', value: data?.totalHRs ?? 0 },
    { label: 'Total Jobs', value: data?.totalJobs ?? 0 },
    { label: 'Total Applications', value: data?.totalApplicationsSystem ?? 0 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 mb-8">System-wide overview</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map(stat => (
            <div key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <p className="text-4xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}