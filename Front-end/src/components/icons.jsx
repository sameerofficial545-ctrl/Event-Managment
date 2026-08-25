const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const IconSparkle = (props) => (
  <svg {...base} {...props}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.1 2.1M15.6 15.6l2.1 2.1M6.3 17.7l2.1-2.1M15.6 8.4l2.1-2.1" />
  </svg>
)

export const IconDashboard = (props) => (
  <svg {...base} {...props}>
    <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.8" />
    <rect x="13" y="3.5" width="7.5" height="4.5" rx="1.8" />
    <rect x="13" y="10.5" width="7.5" height="10" rx="1.8" />
    <rect x="3.5" y="13.5" width="7.5" height="7" rx="1.8" />
  </svg>
)

export const IconEvents = (props) => (
  <svg {...base} {...props}>
    <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
    <path d="M8 3v3M16 3v3M3.5 9.5h17" />
    <path d="M8.5 14l2 2 4-4" />
  </svg>
)

export const IconCalendar = (props) => (
  <svg {...base} {...props}>
    <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
    <path d="M8 3v3M16 3v3M3.5 9.5h17" />
    <circle cx="8.3" cy="14" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
    <circle cx="15.7" cy="14" r="1" fill="currentColor" stroke="none" />
    <circle cx="8.3" cy="17.2" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="17.2" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export const IconUsers = (props) => (
  <svg {...base} {...props}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
    <circle cx="17" cy="8.5" r="2.5" />
    <path d="M15.7 14.8c2.6.3 4.8 2.4 4.8 5.2" />
  </svg>
)

export const IconSettings = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 3.5v2.3M12 18.2v2.3M20.5 12h-2.3M5.8 12H3.5M17.7 6.3l-1.6 1.6M7.9 16.1l-1.6 1.6M17.7 17.7l-1.6-1.6M7.9 7.9 6.3 6.3" />
  </svg>
)

export const IconLogOut = (props) => (
  <svg {...base} {...props}>
    <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
    <path d="M15 16l4-4-4-4M19 12H9" />
  </svg>
)

export const IconMenu = (props) => (
  <svg {...base} {...props}>
    <path d="M4 6.5h16M4 12h16M4 17.5h16" />
  </svg>
)

export const IconX = (props) => (
  <svg {...base} {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const IconSearch = (props) => (
  <svg {...base} {...props}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.3-4.3" />
  </svg>
)

export const IconBell = (props) => (
  <svg {...base} {...props}>
    <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
)

export const IconHeart = (props) => (
  <svg {...base} fill="currentColor" stroke="none" {...props}>
    <path d="M12 20.5s-7.5-4.6-10-9.3C.4 8 1.7 4.6 5 3.6c2.1-.6 4.2.2 5.5 2 .3.4.9.4 1.2 0 1.3-1.8 3.4-2.6 5.5-2 3.3 1 4.6 4.4 3 7.6-2.5 4.7-10 9.3-10 9.3Z" />
  </svg>
)

export const IconGithub = (props) => (
  <svg {...base} fill="currentColor" stroke="none" viewBox="0 0 24 24" {...props}>
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.1.39-1.99 1.03-2.69-.1-.26-.45-1.29.1-2.69 0 0 .84-.27 2.75 1.03a9.4 9.4 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.4.2 2.43.1 2.69.64.7 1.03 1.59 1.03 2.69 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85v2.74c0 .26.18.58.69.48A10 10 0 0 0 12 2Z" />
  </svg>
)

export const IconTwitter = (props) => (
  <svg {...base} fill="currentColor" stroke="none" viewBox="0 0 24 24" {...props}>
    <path d="M17.5 3h3l-6.6 7.5L21.5 21h-6l-4.7-6.1L5.3 21H2.3l7-8-7.1-10h6.2l4.3 5.6L17.5 3Zm-1.1 16.2h1.7L7.6 4.7H5.8l10.6 14.5Z" />
  </svg>
)

export const IconLinkedin = (props) => (
  <svg {...base} fill="currentColor" stroke="none" viewBox="0 0 24 24" {...props}>
    <path d="M6.9 8.6H3.5V20h3.4V8.6ZM5.2 3.6a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM20.5 20h-3.4v-5.9c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V20H9.4V8.6h3.3v1.6h.05c.46-.86 1.6-1.8 3.3-1.8 3.5 0 4.15 2.3 4.15 5.3V20Z" />
  </svg>
)

export const IconPlus = (props) => (
  <svg {...base} {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconPencil = (props) => (
  <svg {...base} {...props}>
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    <path d="M14.5 5.5l4 4" />
  </svg>
)

export const IconTrash = (props) => (
  <svg {...base} {...props}>
    <path d="M4 7h16M9 7V4.8c0-.7.6-1.3 1.3-1.3h3.4c.7 0 1.3.6 1.3 1.3V7M18.5 7l-.7 12.2c-.05.95-.84 1.7-1.8 1.7H8c-.96 0-1.75-.75-1.8-1.7L5.5 7" />
    <path d="M10 11v6M14 11v6" />
  </svg>
)

export const IconClock = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
)

export const IconMapPin = (props) => (
  <svg {...base} {...props}>
    <path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.3" />
  </svg>
)

export const IconMail = (props) => (
  <svg {...base} {...props}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.3" />
    <path d="M4.5 7l7.5 6 7.5-6" />
  </svg>
)

export const IconUserPlus = (props) => (
  <svg {...base} {...props}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
    <path d="M18 8v5M15.5 10.5h5" />
  </svg>
)
