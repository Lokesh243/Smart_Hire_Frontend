import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import JobBoard from './pages/candidate/JobBoard'
import JobDetail from './pages/candidate/JobDetail'
import MyApplications from './pages/candidate/MyApplications'
import HrDashboard from './pages/hr/HrDashboard'
import PostJob from './pages/hr/PostJob'
import MyJobs from './pages/hr/MyJobs'
import Applicants from './pages/hr/Applicants'
import AdminDashboard from './pages/admin/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Candidate */}
        <Route path="/candidate/jobs" element={
          <ProtectedRoute allowedRoles={['CANDIDATE']}>
            <JobBoard />
          </ProtectedRoute>
        } />
        <Route path="/candidate/jobs/:id" element={
          <ProtectedRoute allowedRoles={['CANDIDATE']}>
            <JobDetail />
          </ProtectedRoute>
        } />
        <Route path="/candidate/applications" element={
          <ProtectedRoute allowedRoles={['CANDIDATE']}>
            <MyApplications />
          </ProtectedRoute>
        } />

        {/* HR */}
        <Route path="/hr/dashboard" element={
          <ProtectedRoute allowedRoles={['HR']}>
            <HrDashboard />
          </ProtectedRoute>
        } />
        <Route path="/hr/post-job" element={
          <ProtectedRoute allowedRoles={['HR']}>
            <PostJob />
          </ProtectedRoute>
        } />
        <Route path="/hr/jobs" element={
          <ProtectedRoute allowedRoles={['HR']}>
            <MyJobs />
          </ProtectedRoute>
        } />
        <Route path="/hr/jobs/:jobId/applicants" element={
          <ProtectedRoute allowedRoles={['HR']}>
            <Applicants />
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App