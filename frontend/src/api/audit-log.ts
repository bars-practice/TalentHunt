import { api } from './client'

export interface AuditLogItem {
  id: string;
  timestamp: string;
  username: string;
  role: string;
  ipAddress: string;
  action: string;
}

export const auditLogService = {
  getAll: () => {
    return api.get<AuditLogItem[]>('/audit-logs');
  }
}
