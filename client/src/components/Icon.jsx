const PATHS = {
  chart: '<path d="M4 20V4"/><path d="M4 20h16"/><rect x="7.4" y="12.4" width="3" height="5.2" rx="1"/><rect x="12.4" y="8.6" width="3" height="9" rx="1"/><rect x="17.4" y="5.4" width="3" height="12.2" rx="1"/>',
  book: '<path d="M4.4 5.2A2.4 2.4 0 0 1 6.8 2.8H19v15.6H6.8a2.4 2.4 0 0 0 0 4.8H19"/><path d="M8.4 6.8h6.4"/>',
  pencil: '<path d="M4 20h4.2L20 8.2 15.8 4 4 15.8z"/><path d="M13.6 6.2 17.8 10.4"/>',
  users: '<circle cx="9.2" cy="8.4" r="3.4"/><path d="M3.4 19.6c0-3.1 2.6-5.2 5.8-5.2s5.8 2.1 5.8 5.2"/><path d="M16 5.6a3.2 3.2 0 0 1 0 6.2M17.6 14.8c2 .6 3.4 2.3 3.4 4.6"/>',
  mail: '<rect x="3.2" y="5.4" width="17.6" height="13.2" rx="2.4"/><path d="m4.4 7.4 7.6 5.4 7.6-5.4"/>',
  logout: '<path d="M15 5.4V4a1.6 1.6 0 0 0-1.6-1.6H5.6A1.6 1.6 0 0 0 4 4v16a1.6 1.6 0 0 0 1.6 1.6h7.8A1.6 1.6 0 0 0 15 20v-1.4"/><path d="M9.6 12h10.2M16.4 8.6 19.8 12l-3.4 3.4"/>',
  trash: '<path d="M5.2 7h13.6M9.6 7V4.8h4.8V7M7 7l.9 12.2h8.2L17 7"/><path d="M10.6 10.4v5.8M13.4 10.4v5.8"/>',
  arrow: '<path d="M4.6 12h14.2M13.4 6.6 18.8 12l-5.4 5.4"/>',
  plus: '<path d="M12 5.4v13.2M5.4 12h13.2"/>',
  check: '<path d="M4.8 12.8 9.6 17.6 19.2 6.8"/>',
  calendar: '<rect x="3.6" y="5" width="16.8" height="15" rx="2.4"/><path d="M3.6 9.6h16.8M8.4 3.4v3.2M15.6 3.4v3.2"/>',
  tag: '<path d="M11.2 3.6H20v8.8l-8.6 8.6-8.8-8.8z"/><circle cx="16.2" cy="7.8" r="1.4"/>'
};

export default function Icon({ name, size = 18 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: PATHS[name] || PATHS.chart }}
    />
  );
}
