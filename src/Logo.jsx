export default function Logo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="CODEBNCC"
      className="md3-logo"
    >
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--md-primary)" />
          <stop offset="1" stopColor="var(--md-logo-deep)" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#logo-bg)" />
      <g fill="var(--md-on-primary)" transform="translate(11 0) scale(1.1)">
        <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
      </g>
      <g
        stroke="var(--md-on-primary)"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 30l-6 6 6 6" />
        <path d="M29 30l6 6-6 6" />
        <path d="M26 29l-4 14" />
      </g>
    </svg>
  );
}
