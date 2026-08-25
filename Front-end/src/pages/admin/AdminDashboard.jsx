import { useEffect, useState } from 'react'
import api, { parseApiError } from '../../api/client'
import AppShell from '../../components/AppShell'
import { useAuth } from '../../context/AuthContext'
import { getDisplayName, getInitials } from '../../utils/user'
import './AdminDashboard.css'

function AdminDashboard() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [rowError, setRowError] = useState('')

  useEffect(() => {
    let cancelled = false

    api
      .get('/auth/users/')
      .then(({ data }) => {
        if (!cancelled) setUsers(data)
      })
      .catch((requestError) => {
        if (!cancelled) setError(parseApiError(requestError).message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleRoleToggle = async (targetUser) => {
    const nextRole = targetUser.is_staff ? 'Attendee' : 'Admin'
    setRowError('')
    setUpdatingId(targetUser.id)
    try {
      const { data } = await api.patch(`/auth/users/${targetUser.id}/role/`, { role: nextRole })
      setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)))
    } catch (requestError) {
      setRowError(parseApiError(requestError).generalError)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <AppShell
      headerProps={{
        eyebrow: 'Admin',
        title: 'All registered users',
        searchPlaceholder: 'Search users...',
        showCta: false,
      }}
    >
      <section className="page-intro">
        <span className="page-intro__eyebrow">Admin area 🛡️</span>
        <h2 className="page-intro__title">Registered users</h2>
        <p className="page-intro__text">
          Only visible to staff accounts. {users.length} account{users.length === 1 ? '' : 's'}{' '}
          total.
        </p>
      </section>

      {loading && <p className="admin-table__status">Loading users…</p>}
      {error && <p className="admin-table__status admin-table__status--error">{error}</p>}
      {rowError && <p className="admin-table__status admin-table__status--error">{rowError}</p>}

      {!loading && !error && (
        <div className="admin-table__wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="admin-table__user">
                      <span className="admin-table__avatar">{getInitials(user)}</span>
                      <span>{getDisplayName(user)}</span>
                    </div>
                  </td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`admin-table__badge ${user.is_staff ? 'admin-table__badge--admin' : ''}`}
                    >
                      {user.is_staff ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-table__role-btn"
                      disabled={updatingId === user.id || user.id === currentUser?.id}
                      onClick={() => handleRoleToggle(user)}
                      title={
                        user.id === currentUser?.id
                          ? "You can't change your own role"
                          : undefined
                      }
                    >
                      {updatingId === user.id
                        ? 'Updating…'
                        : user.is_staff
                          ? 'Demote to Attendee'
                          : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  )
}

export default AdminDashboard
