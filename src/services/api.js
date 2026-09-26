import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
})

// Attach token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const login = (data) => API.post('/auth/login', data)
export const register = (data) => API.post('/auth/register', data)
export const getMe = () => API.get('/auth/me')

// Jobs
export const getJobs = (params) => API.get('/jobs', { params })
export const getJobById = (id) => API.get(`/jobs/${id}`)
export const createJob = (data) => API.post('/jobs', data)
export const updateJob = (id, data) => API.put(`/jobs/${id}`, data)
export const closeJob = (id) => API.delete(`/jobs/${id}`)
export const getMyJobs = () => API.get('/jobs/my-jobs')
export const getJobApplicants = (jobId) => API.get(`/applications/job/${jobId}`)

// Applications
export const applyToJob = (data) => API.post('/applications', data)
export const getMyApplications = () => API.get('/applications/mine')
export const updateApplicationStatus = (id, data) => API.patch(`/applications/${id}/status`, data)
export const getApplicationHistory = (id) => API.get(`/applications/${id}/history`)

// Dashboard
export const getHrDashboard = () => API.get('/dashboard/hr')
export const getCandidateDashboard = () => API.get('/dashboard/candidate')
export const getAdminDashboard = () => API.get('/dashboard/admin')