import { useEffect, useState } from 'react'

export interface User {
  id: number
  name: string
  email: string
}

export interface UserListProps {
  /** Path or full URL to the users collection (default `/users` for Vite dev proxy). */
  usersUrl?: string
}

export function UserList({ usersUrl = '/users' }: UserListProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(usersUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`)
        }
        return res.json() as Promise<User[]>
      })
      .then((data) => {
        if (!cancelled) {
          setUsers(Array.isArray(data) ? data : [])
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Something went wrong')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [usersUrl])

  if (loading) {
    return (
      <p className="user-list__status" role="status" aria-live="polite">
        Loading users…
      </p>
    )
  }

  if (error) {
    return (
      <p className="user-list__error" role="alert" aria-live="assertive">
        {error}
      </p>
    )
  }

  if (users.length === 0) {
    return (
      <p className="user-list__status" role="status">
        No users found.
      </p>
    )
  }

  return (
    <section className="user-list" aria-labelledby="user-list-heading">
      <h2 id="user-list-heading">Users</h2>
      <ul className="user-list__items">
        {users.map((user) => (
          <li key={user.id} className="user-list__item">
            <span className="user-list__name">{user.name}</span>
            <span className="user-list__email">{user.email}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
