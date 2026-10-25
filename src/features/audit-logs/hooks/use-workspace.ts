import { getAuditLogTitle } from "../utils/display";
import { useAuditLog } from "./use-data";
export function useAuditLogWorkspace(id: number) {
	const { auditLog } = useAuditLog(id);
	return { auditLog, title: getAuditLogTitle(auditLog) };
}
