import { api } from './client'

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  ipAddress: string;
  action: string;
}

export const auditLogService = {
  getAll: () => {
    return api.get<AuditLogItem[]>('/audit-logs');
  }
}
