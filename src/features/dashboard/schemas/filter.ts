import * as z from "zod";

const now = new Date();
const currentYear = now.getUTCFullYear();
const defaultDateFrom = `${currentYear}-01-01`;
const defaultDateTo = `${currentYear}-12-31`;

function isValidDate(value: string): boolean {
	if (!value) {
		return true;
	}

	return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export const dashboardFilterSchema = z
	.object({
		dateFrom: z.string().catch(defaultDateFrom).default(defaultDateFrom),
		dateTo: z.string().catch(defaultDateTo).default(defaultDateTo),
		employeeId: z.string().catch("").default(""),
		legalArea: z.string().catch("").default(""),
		revenueType: z.string().catch("").default(""),
	})
	.refine((value) => isValidDate(value.dateFrom), {
		message: "Data inicial inválida",
		path: ["dateFrom"],
	})
	.refine((value) => isValidDate(value.dateTo), {
		message: "Data final inválida",
		path: ["dateTo"],
	})
	.refine(
		(value) => {
			if (!value.dateFrom || !value.dateTo) {
				return true;
			}

			return value.dateFrom <= value.dateTo;
		},
		{
			message: "A data inicial deve ser anterior à data final",
			path: ["dateFrom"],
		},
	);

export type DashboardFilter = z.infer<typeof dashboardFilterSchema>;
