// Deliberately simple - just "does this look like an email", not a full
// RFC 5322 check. The backend still re-validates on submit.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(value.trim())
}
