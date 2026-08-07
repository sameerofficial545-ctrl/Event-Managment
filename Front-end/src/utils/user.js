export function getDisplayName(user) {
  if (!user) return ''
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim()
  return fullName || user.username
}

export function getInitials(user) {
  const name = getDisplayName(user)
  if (!name) return '?'
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
  return initials || '?'
}
