window.addEventListener('keydown', e => {
  const wc = require('electron').ipcRenderer;
  if (e.ctrlKey && (e.key === '-' || e.key === '_')) {
    wc.send('zoom-out');
  }
  if (e.ctrlKey && (e.key === '=' || (e.shiftKey && e.key === '+'))) {
    wc.send('zoom-in');
  }
});