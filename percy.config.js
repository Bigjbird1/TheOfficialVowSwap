module.exports = {
  version: 2,
  snapshot: {
    widths: [375, 768, 1280], // Mobile, tablet, desktop
    minHeight: 1024,
    percyCSS: '',
    scope: '**/*.{js,jsx,ts,tsx}',
    discovery: {
      allowedHostnames: [], // Add allowed hostnames for external resources
      disallowedHostnames: [], // Add disallowed hostnames
    },
  },
  // Critical pages to test
  static: {
    include: [
      '/checkout',
      '/orders',
      '/seller/dashboard',
      '/admin/dashboard',
      '/registry'
    ],
  }
}
