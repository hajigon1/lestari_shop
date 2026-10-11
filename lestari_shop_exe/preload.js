const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('lestariDB', {
  load: () => ipcRenderer.invoke('lestari-db:load'),
  save: (state) => ipcRenderer.invoke('lestari-db:save', state)
});
