const { contextBridge, ipcRenderer } = require("electron");

window.addEventListener('DOMContentLoaded', () => {
  // Exponemos de forma segura la librería XLSX al script del renderizador (inventario.js)
  // Ahora estará disponible en `window.xlsxAPI`
  contextBridge.exposeInMainWorld('xlsxAPI', {
    writeFile: (workbook, filename) => window.XLSX.writeFile(workbook, filename),
    utils: window.XLSX.utils // Exponemos todo el objeto utils
  })});

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
  deleteUser: (userId) => ipcRenderer.invoke("usuarios:delete", userId),
  updateUser: (userId, updates) =>
    ipcRenderer.invoke("usuarios:update", { userId, updates }),
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
  getAllProductos: () => ipcRenderer.invoke('productos:getAll'),
  searchProductos: (query) => ipcRenderer.invoke('productos:search', query),
  getProductosByCategoria: (categoriaId) => ipcRenderer.invoke('productos:getByCategoria', categoriaId),
  createProducto: (producto) => ipcRenderer.invoke('productos:create', producto),
  updateProducto: (id, producto) => ipcRenderer.invoke('productos:update', { id, updates: producto }),
  deleteProducto: (id) => ipcRenderer.invoke('productos:delete', id),
  getCategorias: () => ipcRenderer.invoke('categoria:getCategoria'),
  getProductoByID: (id) => ipcRenderer.invoke('productos:getByID', id),
  getProductoByName: (name) => ipcRenderer.invoke('productos:getByName', name),
  createOrdenVenta: (ordenVentaData, productos) => ipcRenderer.invoke('ordenVenta:create', ordenVentaData, productos),
  getAllOrdenesVenta: () => ipcRenderer.invoke('ordenVenta:getAll'),
  getOrdenVentaById: (id) => ipcRenderer.invoke('ordenVenta:getById', id),
  updateOrdenVenta: (id, ordenVentaData, productos) => ipcRenderer.invoke('ordenVenta:update', id, ordenVentaData, productos),
  deleteOrdenVenta: (id) => ipcRenderer.invoke('ordenVenta:delete', id),
  createOrdenCompra: (ordenCompraData, productos) => ipcRenderer.invoke('ordenCompra:create', ordenCompraData, productos),
  getAllOrdenesCompra: () => ipcRenderer.invoke('ordenCompra:getAll'),
  getOrdenCompraById: (id) => ipcRenderer.invoke('ordenCompra:getById', id),
  updateOrdenCompra: (id, ordenCompraData, productos) => ipcRenderer.invoke('ordenCompra:update', id, ordenCompraData, productos),
  deleteOrdenCompra: (id) => ipcRenderer.invoke('ordenCompra:delete', id),
  searchOrdenesVenta: (criteria) => ipcRenderer.invoke('ordenVenta:search', criteria),
  searchOrdenesCompra: (criteria) => ipcRenderer.invoke('ordenCompra:search', criteria),
  insertIntoCuentasPorCobrar: (idOrdenVenta, paymentData) => ipcRenderer.invoke('cuentasPorCobrar:insert', idOrdenVenta, paymentData),
  insertIntoCuentasPorPagar: (idOrdenCompra, paymentData) => ipcRenderer.invoke('cuentasPorPagar:insert', idOrdenCompra, paymentData),
  reporteExcelProductos: () => ipcRenderer.invoke('productos:exportarExcel'),
  generarReporteOrdenes: (data) => ipcRenderer.invoke("ordenes:generar-reporte-pdf", data),
  generarReporteClientes: (clientesData) => ipcRenderer.invoke("clientes:generar-reporte-pdf", clientesData),
  generarCotizacion: (cotizacion) => ipcRenderer.invoke("inventario:generar-cotizacion", cotizacion),
});
