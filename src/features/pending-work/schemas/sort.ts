import { createSortSchema } from "@/shared/schemas/sort";
import { PENDING_WORK_ALLOWED_SORT_COLUMNS } from "../constants/sorting";
import type { PendingWork } from "./model";
export const pendingWorkSortSchema = createSortSchema<PendingWork>({
	columns: PENDING_WORK_ALLOWED_SORT_COLUMNS,
	defaultColumn: "severity",
});
