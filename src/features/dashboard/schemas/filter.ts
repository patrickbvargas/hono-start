import * as z from "zod";

function isValidDate(value: string): boolean {
	if (!value) {
		return true;
	}

	return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export const dashboardFilterSchema = z
	.object({
		dateFrom: z.string().catch("").default(""),
		dateTo: z.string().catch("").default(""),
		employeeId: z.string().catch("").default(""),
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
