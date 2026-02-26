
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/calculator/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/calculator"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 11649, hash: 'ac430b4a18b78775cae2ee2df5cb21348aac6fbaac46a632754d43990a0b1e0a', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1202, hash: 'fc4a55eea460c54b3b085fed4b3eee4e9708036bd3a3f0d95231957df6080245', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 21189, hash: '4fe7ab9225c181a6fe528b05e6e34129203fee08e46d2bfba71313513853264c', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-5BBKNX5G.css': {size: 10835, hash: 'zalAmJSgdU8', text: () => import('./assets-chunks/styles-5BBKNX5G_css.mjs').then(m => m.default)}
  },
};
