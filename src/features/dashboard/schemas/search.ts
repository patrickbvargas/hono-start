import type * as z from "zod";
import { dashboardFilterSchema } from "./filter";

export const dashboardSearchSchema = dashboardFilterSchema;

export type DashboardSearch = z.infer<typeof dashboardSearchSchema>;
