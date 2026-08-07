// Format check first - "does this look like local@domain.tld".
const EMAIL_PATTERN = /^[^\s@]+@([^\s@]+)\.([^\s@.]+)$/

// Then a TLD sanity check, so a typo like "gmail.xom" or "yahoo.con"
// (syntactically valid, but not a real TLD) gets caught too. This is a
// curated list, not the full ~1500-entry IANA registry, so it covers the
// overwhelming majority of real addresses without being exhaustive. It
// can't catch a misspelled domain that keeps a real TLD (e.g. "gmial.com")
// - only actually verifying the address (a confirmation email) can do that.
const COMMON_TLDS = new Set([
  // generic
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'info', 'biz', 'name',
  'pro', 'coop', 'museum', 'aero', 'jobs', 'mobi', 'travel', 'tel', 'asia',
  'cat', 'xxx', 'post',
  // popular newer gTLDs
  'io', 'co', 'dev', 'app', 'ai', 'xyz', 'online', 'site', 'store', 'blog',
  'cloud', 'digital', 'agency', 'solutions', 'systems', 'network',
  'software', 'studio', 'design', 'media', 'email', 'live', 'life',
  'world', 'today', 'news', 'group', 'team', 'company', 'business',
  'careers', 'click', 'link', 'tech', 'shop', 'academy',
  'me', 'tv', 'cc', 'ws', 'fm', 'gg', 'gs', 'la', 'nu', 'sh', 'so', 'st',
  'to', 'vc',
  // country-code TLDs
  'us', 'uk', 'ca', 'au', 'de', 'fr', 'jp', 'cn', 'in', 'br', 'ru', 'it',
  'es', 'nl', 'se', 'no', 'dk', 'fi', 'pl', 'ch', 'at', 'be', 'pt', 'gr',
  'ie', 'nz', 'sg', 'hk', 'kr', 'mx', 'ar', 'cl', 'za', 'ng', 'eg', 'sa',
  'ae', 'il', 'tr', 'ua', 'cz', 'hu', 'ro', 'bg', 'hr', 'sk', 'si', 'lt',
  'lv', 'ee', 'is', 'lu', 'mt', 'cy', 'id', 'th', 'vn', 'ph', 'my', 'pk',
  'bd', 'lk', 'np',
])

export function isValidEmail(value) {
  const match = EMAIL_PATTERN.exec(value.trim())
  if (!match) return false
  const tld = match[2].toLowerCase()
  return COMMON_TLDS.has(tld)
}
