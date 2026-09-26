import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getJobApplicants, updateApplicationStatus, getJobById } from '../../services/api'
import Navbar from '../../components/Navbar'
import axios from 'axios'

const statusColors = {
  APPLIED:   'bg-blue-100 text-blue-700',
  SCREENED:  'bg-yellow-100 text-yellow-700',
  INTERVIEW: 'bg-purple-100 text-purple-700',
  OFFER:     'bg-green-100 text-green-700',
  REJECTED:  'bg-red-100 text-red-700',
}

const nextStages = {
  APPLIED:   ['SCREENED', 'REJECTED'],
  SCREENED:  ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['OFFER', 'REJECTED'],
  OFFER:     [],
  REJECTED:  [],
}

const scoreColor = (score) => {
  if (score >= 75) return 'text-green-600'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-500'
}

export default function Applicants() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [applicants, setApplicants] = useState([])
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [resumeScores, setResumeScores] = useState({})
  const [analyzingId, setAnalyzingId] = useState(null)
  const [interviewQuestions, setInterviewQuestions] = useState({})
  const [loadingQuestionsId, setLoadingQuestionsId] = useState(null)
  const [summaries, setSummaries] = useState({})
  const [summarizingId, setSummarizingId] = useState(null)
  const [rejectionEmail, setRejectionEmail] = useState(null)
  const [writingEmailFor, setWritingEmailFor] = useState(null)
  const [showEmailModal, setShowEmailModal] = useState(false)

  useEffect(() => {
    Promise.all([
      getJobApplicants(jobId),
      getJobById(jobId)
    ])
      .then(([appRes, jobRes]) => {
        setApplicants(appRes.data)
        setJob(jobRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [jobId])

  // ── Move stage ─────────────────────────────────────────────────
  const handleStatusUpdate = async (appId, status) => {
    setUpdating(appId)
    try {
      await updateApplicationStatus(appId, {
        status, notes: `Moved to ${status}`
      })
      setApplicants(prev => prev.map(app =>
        app.id === appId ? { ...app, status } : app
      ))
      if (status === 'INTERVIEW') {
        const app = applicants.find(a => a.id === appId)
        if (app && job) generateInterviewQuestions(appId, app.candidateName)
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  // ── Reject with AI email ───────────────────────────────────────
  const handleRejection = async (app) => {
    setUpdating(app.id)
    try {
      await updateApplicationStatus(app.id, {
        status: 'REJECTED',
        notes: 'Application rejected'
      })
      setApplicants(prev => prev.map(a =>
        a.id === app.id ? { ...a, status: 'REJECTED' } : a
      ))
      setWritingEmailFor(app)
      const token = localStorage.getItem('token')
      const res = await axios.post(
        'http://localhost:8080/api/v1/ai/rejection-email',
        {
          candidateName: app.candidateName,
          jobTitle: job?.title,
          companyName: 'SmartHire'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setRejectionEmail(res.data.email)
      setShowEmailModal(true)
    } catch (err) {
      console.error('Rejection failed', err)
    } finally {
      setUpdating(null)
    }
  }

  // ── Resume match score ─────────────────────────────────────────
  const analyzeResume = async (app) => {
    if (!app.resumeUrl || !job) return
    setAnalyzingId(app.id)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(
        'http://localhost:8080/api/v1/ai/match-resume',
        {
          resumeUrl: app.resumeUrl,
          jobTitle: job.title,
          jobDescription: job.description
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setResumeScores(prev => ({ ...prev, [app.id]: res.data }))
    } catch (err) {
      console.error('Resume analysis failed', err)
    } finally {
      setAnalyzingId(null)
    }
  }

  // ── Interview questions ────────────────────────────────────────
  const generateInterviewQuestions = async (appId, candidateName) => {
    if (!job) return
    setLoadingQuestionsId(appId)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(
        'http://localhost:8080/api/v1/ai/interview-questions',
        {
          jobTitle: job.title,
          jobDescription: job.description,
          candidateName
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setInterviewQuestions(prev => ({ ...prev, [appId]: res.data }))
    } catch (err) {
      console.error('Interview question generation failed', err)
    } finally {
      setLoadingQuestionsId(null)
    }
  }

  // ── Candidate summarizer ───────────────────────────────────────
  const summarizeCandidate = async (app) => {
    if (!app.resumeUrl || !job) return
    setSummarizingId(app.id)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(
        'http://localhost:8080/api/v1/ai/summarize-candidate',
        {
          candidateName: app.candidateName,
          resumeUrl: app.resumeUrl,
          jobTitle: job.title
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSummaries(prev => ({ ...prev, [app.id]: res.data }))
    } catch (err) {
      console.error('Summarization failed', err)
    } finally {
      setSummarizingId(null)
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
      <div className="max-w-5xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/hr/jobs')}
          className="text-blue-600 hover:underline text-sm mb-6 inline-block">
          ← Back to my jobs
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-1">Applicants</h1>
        {job && (
          <p className="text-gray-500 mb-6">
            {job.title} · {job.location} · {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
          </p>
        )}

        {applicants.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No applicants yet</div>
        ) : (
          <div className="space-y-6">
            {applicants.map(app => (
              <div key={app.id}
                className="bg-white rounded-xl border border-gray-200 p-6">

                {/* ── Candidate info ─────────────────────────── */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {app.candidateName}
                    </h2>
                    <p className="text-gray-500 text-sm">{app.candidateEmail}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                    {app.resumeUrl && (
                      <a href={app.resumeUrl} target="_blank" rel="noreferrer"
                        className="text-blue-600 text-sm hover:underline mt-1 inline-block">
                        View Resume →
                      </a>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[app.status]}`}>
                    {app.status}
                  </span>
                </div>

                {/* ── AI Candidate Summary ───────────────────── */}
                {app.resumeUrl && (
                  <div className="mt-3">
                    {!summaries[app.id] ? (
                      <button
                        onClick={() => summarizeCandidate(app)}
                        disabled={summarizingId === app.id}
                        className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 font-medium"
                      >
                        {summarizingId === app.id
                          ? '⟳ Summarizing...'
                          : '📋 AI Summary'}
                      </button>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs space-y-1">
                        <p className="text-gray-700">
                          {summaries[app.id].summary}
                        </p>
                        <p className="text-green-700">
                          <span className="font-medium">Strength:</span>{' '}
                          {summaries[app.id].strength}
                        </p>
                        <p className="text-blue-700">
                          <span className="font-medium">Recommendation:</span>{' '}
                          {summaries[app.id].recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── AI Resume Score ────────────────────────── */}
                {app.resumeUrl && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    {!resumeScores[app.id] ? (
                      <button
                        onClick={() => analyzeResume(app)}
                        disabled={analyzingId === app.id}
                        className="flex items-center gap-2 text-xs bg-purple-50 text-purple-700 border border-purple-200 px-3 py-2 rounded-lg hover:bg-purple-100 transition disabled:opacity-50 font-medium"
                      >
                        {analyzingId === app.id ? (
                          <><span className="animate-spin">⟳</span> Analyzing resume...</>
                        ) : (
                          <>✨ AI Resume Match Score</>
                        )}
                      </button>
                    ) : (
                      <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-purple-800">
                            ✨ AI Resume Analysis
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-2xl font-bold ${scoreColor(resumeScores[app.id].matchScore)}`}>
                              {resumeScores[app.id].matchScore}%
                            </span>
                            <span className="text-xs text-gray-500">
                              {resumeScores[app.id].matchLevel}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div
                            className={`h-2 rounded-full ${
                              resumeScores[app.id].matchScore >= 75
                                ? 'bg-green-500'
                                : resumeScores[app.id].matchScore >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${resumeScores[app.id].matchScore}%` }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="font-medium text-green-700 mb-1">
                              ✅ Strengths
                            </p>
                            <ul className="space-y-0.5">
                              {resumeScores[app.id].strengths?.map((s, i) => (
                                <li key={i} className="text-gray-600">• {s}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium text-red-600 mb-1">
                              ⚠️ Missing Skills
                            </p>
                            <ul className="space-y-0.5">
                              {resumeScores[app.id].missingSkills?.map((s, i) => (
                                <li key={i} className="text-gray-600">• {s}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <p className="text-xs text-purple-700 mt-3 font-medium">
                          💡 {resumeScores[app.id].recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Move stage buttons ─────────────────────── */}
                {nextStages[app.status]?.length > 0 && (
                  <div className="mt-4 flex gap-2 items-center">
                    <span className="text-sm text-gray-500">Move to:</span>
                    {nextStages[app.status].map(next => (
                      <button
                        key={next}
                        disabled={updating === app.id}
                        onClick={() => next === 'REJECTED'
                          ? handleRejection(app)
                          : handleStatusUpdate(app.id, next)
                        }
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-50 ${
                          next === 'REJECTED'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        {updating === app.id ? '...' : next}
                      </button>
                    ))}
                  </div>
                )}

                {/* ── Interview Questions ────────────────────── */}
                {(app.status === 'INTERVIEW' || interviewQuestions[app.id]) && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    {!interviewQuestions[app.id] ? (
                      <button
                        onClick={() => generateInterviewQuestions(
                          app.id, app.candidateName
                        )}
                        disabled={loadingQuestionsId === app.id}
                        className="flex items-center gap-2 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-2 rounded-lg hover:bg-blue-100 transition disabled:opacity-50 font-medium"
                      >
                        {loadingQuestionsId === app.id ? (
                          <><span className="animate-spin">⟳</span> Generating...</>
                        ) : (
                          <>🎯 Generate Interview Questions</>
                        )}
                      </button>
                    ) : (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <p className="text-sm font-semibold text-blue-800 mb-3">
                          🎯 AI Interview Questions for {app.candidateName}
                        </p>
                        <ol className="space-y-2">
                          {interviewQuestions[app.id].map((q, i) => (
                            <li key={i} className="text-sm text-gray-700 flex gap-2">
                              <span className="font-bold text-blue-600 shrink-0">
                                {i + 1}.
                              </span>
                              {q}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

        {/* ── Rejection Email Modal ──────────────────────────────── */}
        {showEmailModal && rejectionEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  ✉️ AI Rejection Email
                </h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                To: {writingEmailFor?.candidateEmail}
              </p>
              <textarea
                rows={10}
                defaultValue={rejectionEmail}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(rejectionEmail)
                    alert('Email copied to clipboard!')
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  📋 Copy Email
                </button>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}