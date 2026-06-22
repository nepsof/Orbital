const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('orbital', {
  platform: process.platform,
  hasCustomTitlebar: true,
  getApiBase: () => ipcRenderer.invoke('get-api-base'),
  onFocusSearch: (cb) => ipcRenderer.on('focus-search', () => cb()),
  openFile: (path) => ipcRenderer.send('open-file', path),
});