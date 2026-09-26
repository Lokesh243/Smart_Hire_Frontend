import { useState, useEffect } from 'react'
import { getMyApplications } from '../../services/api'
import Navbar from '../../components/Navbar'

const statusColors = {
  APPLIED:   'bg-blue-100 text-blue-700',
  SCREENED:  'bg-yellow-100 text-yellow-700',
  INTERVIEW: 'bg-purple-100 text-purple-700',
  OFFER:     'bg-green-100 text-green-700',
  REJECTED:  'bg-red-100 text-red-700',
}

export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyApplications()
      .then(res => setApplications(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Applications</h1>
        <p className="text-gray-500 mb-6">Track your application status</p>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : applications.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            You haven't applied to any jobs yet.
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{app.jobTitle}</h2>
                    <p className="text-gray-500 mt-1">{app.jobLocation}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[app.status]}`}>
                    {app.status}
                  </span>
                </div>

                {/* Stage history timeline */}
                {app.stageHistory?.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="text-sm font-medium text-gray-600 mb-3">Stage History</p>
                    <div className="space-y-2">
                      {app.stageHistory.map(stage => (
                        <div key={stage.id} className="flex items-center gap-3 text-sm">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[stage.stage]}`}>
                            {stage.stage}
                          </span>
                          <span className="text-gray-400">
                            {new Date(stage.movedAt).toLocaleString()}
                          </span>
                          {stage.notes && (
                            <span className="text-gray-500">— {stage.notes}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}