import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getJobs } from '../../services/api'
import Navbar from '../../components/Navbar'
import axios from 'axios'

export default function JobBoard() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ title: '', location: '' })
  const [aiQuery, setAiQuery] = useState('')
  const [aiSearching, setAiSearching] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [loadingRecs, setLoadingRecs] = useState(false)
  const navigate = useNavigate()

  const fetchRecommendations = async (allJobs) => {
    if (allJobs.length < 2) return
    setLoadingRecs(true)
    try {
      const availableJobs = allJobs.slice(0, 10).map(j => ({
        jobId: j.id,
        title: j.title,
        location: j.location,
        jobType: j.jobType
      }))
      const res = await axios.post(
        'http://localhost:8080/api/v1/ai/recommend-jobs',
        {
          candidateHistory: 'Candidate interested in backend development, Java, Spring Boot',
          availableJobs
        }
      )
      const recIds = res.data
        .map(r => ({
          ...allJobs.find(j => j.id === r.jobId),
          reason: r.reason
        }))
        .filter(Boolean)
      setRecommendations(recIds)
    } catch (err) {
      console.error('Recommendations failed', err)
    } finally {
      setLoadingRecs(false)
    }
  }

  const fetchJobs = async (overrideFilters = null) => {
    setLoading(true)
    try {
      const params = overrideFilters || filters
      const res = await getJobs(params)
      const allJobs = res.data.content || []
      setJobs(allJobs)
      if (!overrideFilters) fetchRecommendations(allJobs)
    } catch (err) {
      console.error('Failed to fetch jobs', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchJobs()
  }

  const handleAiSearch = async (e) => {
    e.preventDefault()
    if (!aiQuery.trim()) return
    setAiSearching(true)
    try {
      const res = await axios.post(
        'http://localhost:8080/api/v1/ai/search-filters',
        { query: aiQuery }
      )
      const { title, location, jobType } = res.data
      const newFilters = {
        title: title || '',
        location: location || '',
        jobType: jobType || ''
      }
      setFilters({ title: newFilters.title, location: newFilters.location })
      await fetchJobs(newFilters)
    } catch (err) {
      console.error('AI search failed', err)
    } finally {
      setAiSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Find Your Next Job
        </h1>
        <p className="text-gray-500 mb-6">
          Browse open positions and apply today
        </p>

        {/* ── AI Search ─────────────────────────────────────────── */}
        <form onSubmit={handleAiSearch} className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-2.5 text-purple-500 text-sm">
              ✨
            </span>
            <input
              type="text"
              placeholder='Try: "remote Java job" or "full-time backend role in Hyderabad"'
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              className="w-full border border-purple-200 bg-purple-50 rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={aiSearching}
            className="bg-purple-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 text-sm whitespace-nowrap"
          >
            {aiSearching ? 'Searching...' : '✨ AI Search'}
          </button>
        </form>

        {/* ── Divider ───────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-400">or search manually</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* ── Manual Search ─────────────────────────────────────── */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="Job title or keyword"
            value={filters.title}
            onChange={e => setFilters({ ...filters, title: e.target.value })}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={e => setFilters({ ...filters, location: e.target.value })}
            className="w-48 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Search
          </button>
        </form>

        {/* ── AI Recommendations ────────────────────────────────── */}
        {(recommendations.length > 0 || loadingRecs) && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              ✨ Recommended for You
            </h2>
            {loadingRecs ? (
              <div className="text-sm text-gray-400">
                Finding best matches...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recommendations.map(job => (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/candidate/jobs/${job.id}`)}
                    className="bg-white border-2 border-purple-200 rounded-xl p-4 cursor-pointer hover:border-purple-400 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {job.title}
                      </h3>
                      <span className="text-purple-500 text-xs shrink-0 ml-2">
                        ✨ Match
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {job.location} · {job.jobType}
                    </p>
                    <p className="text-xs text-purple-700 bg-purple-50 rounded-lg px-2 py-1">
                      {job.reason}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Job List ──────────────────────────────────────────── */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">
            Loading jobs...
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            No jobs found
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div
                key={job.id}
                onClick={() => navigate(`/candidate/jobs/${job.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 cursor-pointer transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {job.title}
                    </h2>
                    <p className="text-gray-500 mt-1">
                      {job.location} · {job.jobType}
                    </p>
                    <p className="text-gray-600 mt-3 line-clamp-2">
                      {job.description}
                    </p>
                  </div>
                  <div className="text-right ml-6 shrink-0">
                    <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                      {job.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-2">
                      {job.totalApplicants} applicant{job.totalApplicants !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Posted by {job.postedByName}
                  </span>
                  <span className="text-sm text-gray-400">
                    Expires {job.expiresAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}