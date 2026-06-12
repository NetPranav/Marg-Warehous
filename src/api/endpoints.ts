import client from './client';

export const authApi = {
  login: (email: string, password: string) =>
    client.post('/auth/login/', { email, password }),
  profile: () => client.get('/auth/me/'),
};

export const dashboardApi = {
  warehouse: () => client.get('/dashboard/warehouse/'),
};

export const shipmentsApi = {
  list: (params?: Record<string, unknown>) => client.get('/shipments/', { params }),
  get: (id: number) => client.get(`/shipments/${id}/`),
  timeline: (id: number) => client.get(`/shipments/${id}/timeline/`),
  eta: (id: number) => client.get(`/shipments/${id}/eta/`),
  markArrived: (id: number) => client.post(`/shipments/${id}/mark-arrived/`),
  startUnloading: (id: number) => client.post(`/shipments/${id}/start-unloading/`),
  complete: (id: number) => client.post(`/shipments/${id}/complete/`),
};

export const warehousesApi = {
  list: (params?: Record<string, unknown>) => client.get('/warehouses/', { params }),
  get: (id: number) => client.get(`/warehouses/${id}/`),
};

export const docksApi = {
  list: (params?: Record<string, unknown>) => client.get('/docks/', { params }),
  get: (id: number) => client.get(`/docks/${id}/`),
  update: (id: number, data: Record<string, unknown>) => client.patch(`/docks/${id}/`, data),
};

export const recommendationsApi = {
  list: (params?: Record<string, unknown>) => client.get('/dock-recommendations/', { params }),
  get: (id: number) => client.get(`/dock-recommendations/${id}/`),
  approve: (id: number) => client.post(`/dock-recommendations/${id}/approve/`),
  reject: (id: number) => client.post(`/dock-recommendations/${id}/reject/`),
};

export const notificationsApi = {
  list: (params?: Record<string, unknown>) => client.get('/notifications/', { params }),
  markRead: (id: number) => client.post(`/notifications/${id}/mark-read/`),
  markAllRead: () => client.post('/notifications/mark-all-read/'),
  unreadCount: () => client.get('/notifications/unread-count/'),
};

// ─── Phase 7: Slotting APIs ────────────────────────────────────────────────

export const slottingApi = {
  // Layout
  getLayout: (warehouseId?: number) =>
    client.get('/warehouse-layout/', { params: warehouseId ? { warehouse: warehouseId } : {} }),
  updateLayout: (data: Record<string, unknown>) =>
    client.patch('/warehouse-layout/', data),

  // Racks
  listRacks: (params?: Record<string, unknown>) =>
    client.get('/racks/', { params }),
  createRack: (data: Record<string, unknown>) =>
    client.post('/racks/', data),
  updateRack: (id: number, data: Record<string, unknown>) =>
    client.patch(`/racks/${id}/`, data),
  deleteRack: (id: number) =>
    client.delete(`/racks/${id}/`),

  // Shelves
  listShelves: (params?: Record<string, unknown>) =>
    client.get('/shelves/', { params }),
  updateShelf: (id: number, data: Record<string, unknown>) =>
    client.patch(`/shelves/${id}/`, data),

  // Parcels
  listParcels: (params?: Record<string, unknown>) =>
    client.get('/parcels/', { params }),
  getParcel: (id: number) =>
    client.get(`/parcels/${id}/`),
  createParcel: (data: Record<string, unknown>) =>
    client.post('/parcels/', data),

  // Slotting intelligence
  recommend: (data: Record<string, unknown>) =>
    client.post('/slotting/recommend/', data),
  assign: (data: { parcel_id: string; shelf_id: number }) =>
    client.post('/slotting/assign/', data),
  manualOverride: (data: { parcel_id: string; target_shelf_id: number; validate?: boolean }) =>
    client.patch('/slotting/manual-override/', data),
};
