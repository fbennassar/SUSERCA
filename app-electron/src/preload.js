const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  login: (email, password) =>
    ipcRenderer.invoke("usuarios:login", { email, password }),
  closeApp: () => ipcRenderer.send("close-app"),
  getUser: () => ipcRenderer.invoke("auth:getUser"),
  getProfile: (userId) => ipcRenderer.invoke("auth:getProfile", userId),
  getRol: () => ipcRenderer.invoke("rol:getRol"),
  signOut: () => ipcRenderer.invoke("auth:signOut"),
  inviteUser: (inviteData) => ipcRenderer.invoke("usuarios:invite", inviteData),
  createUser: (userData) => ipcRenderer.invoke("usuarios:create", userData),
  signOutAndClear: () => ipcRenderer.invoke("usuarios:logout"),
  searchClients: (query) =>
    ipcRenderer.invoke("clientes:searchClients", query),
  getAllClients: () => ipcRenderer.invoke("clientes:getAllClients"),
  getClientByID: (id) => ipcRenderer.invoke("clientes:getClientByID", id),
  getClientByName: (name) =>
    ipcRenderer.invoke("clientes:getClientByName", name),
  createClient: (clientData) =>
    ipcRenderer.invoke("clientes:create", clientData),
  updateClient: (id, updates) =>
    ipcRenderer.invoke("clientes:update", { id, updates }),
  deleteClient: (id) => ipcRenderer.invoke("clientes:delete", id),
  getAllProfiles: (nombreFilter, rolFilter) =>
    ipcRenderer.invoke("users:getAllProfiles", nombreFilter, rolFilter),
  searchProveedores: (query) =>
    ipcRenderer.invoke("proveedores:search", query),
  getAllProveedores: () => ipcRenderer.invoke("proveedores:getAll"),
  getProveedorById: (id) =>
    ipcRenderer.invoke("proveedores:getProveedorById", id),
  getProveedorByName: (name) =>
    ipcRenderer.invoke("proveedores:getProveedorByName", name),
  createProveedor: (proveedorData) =>
    ipcRenderer.invoke("proveedores:create", proveedorData),
  updateProveedor: (id, updates) =>
    ipcRenderer.invoke("proveedores:update", { id, updates }),
  deleteProveedor: (id) => ipcRenderer.invoke("proveedores:delete", id),
  getProfileSeguro: () => ipcRenderer.invoke("get-profile-seguro"),
});
