import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  close: () => ipcRenderer.invoke('window-close'),

  // Auth: Popup
  authMicrosoft: () => ipcRenderer.invoke('auth-microsoft'),

  // Auth: Device Code (Link)
  authMicrosoftLinkStart: () => ipcRenderer.invoke('auth-microsoft-link-start'),
  authMicrosoftLinkPoll: (deviceCode: string, interval: number, expiresIn: number) =>
    ipcRenderer.invoke('auth-microsoft-link-poll', deviceCode, interval, expiresIn),

  // External links
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),

  // Game launch
  launchGame: (profile: any) => ipcRenderer.invoke('launch-game', profile),
});
