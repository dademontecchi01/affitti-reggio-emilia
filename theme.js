// Applicato prima del CSS per evitare un lampo chiaro all'apertura del tema scuro.
(() => {
  let saved;
  try { saved = localStorage.getItem('cca-local-theme'); } catch {}
  const theme = saved === 'light' || saved === 'dark'
    ? saved
    : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
})();
