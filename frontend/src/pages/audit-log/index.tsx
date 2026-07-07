import { useEffect, useState } from "react";
import { auditLogService, type AuditLogItem } from "@/api/audit-log";
import styles from "./styles.module.css";

export function AuditLog() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await auditLogService.getAll();
        setLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Журнал аудита</h1>

      {loading ? (
        <div className={`${styles.tableWrapper} styles.messageCell`}>
          Загрузка логов...
        </div>
      ) : error ? (
        <div className={`${styles.tableWrapper} styles.errorCell`}>
          Ошибка: {error}
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ВРЕМЯ</th>
                <th>ПОЛЬЗОВАТЕЛЬ</th>
                <th>IP-АДРЕС</th>
                <th>ДЕЙСТВИЕ</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.emptyCell}>
                    Записей в журнале аудита пока нет
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className={styles.timeCell}>
                      {new Date(log.timestamp).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className={styles.userCell}>
                      <div className={styles.username}>{log.user}</div>
                    </td>
                    <td className={styles.ipCell}>{log.ipAddress}</td>
                    <td className={styles.actionCell}>{log.action}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}