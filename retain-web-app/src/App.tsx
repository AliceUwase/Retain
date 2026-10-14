import { Navigate, Route, Routes } from 'react-router-dom'
import AdminRoute from './components/AdminRoute'
import ProtectedRoute from './components/ProtectedRoute'
import AdminCategories from './pages/AdminCategories'
import AdminDashboard from './pages/AdminDashboard'
import Budget from './pages/Budget'
import Dashboard from './pages/Dashboard'
import ExpenseDetail from './pages/ExpenseDetail'
import Expenses from './pages/Expenses'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Register from './pages/Register'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* logged-in users only */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/expenses/:id" element={<ExpenseDetail />} />
        <Route path="/budget" element={<Budget />} />

        {/* admins only */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
