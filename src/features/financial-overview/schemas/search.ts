import * as z from "zod";
import { getCurrentYearDateRange } from "../utils/period-shortcuts";

const currentYearDateRange = getCurrentYearDateRange();
const defaultDateFrom = currentYearDateRange.dateFrom;
const defaultDateTo = currentYearDateRange.dateTo;

function isValidDate(value: string): boolean {
	if (!value) {
		return true;
	}
	return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export const financialOverviewSearchDefaults = {
	dateFrom: defaultDateFrom,
	dateTo: defaultDateTo,
	analytic: "",
	paymentMethods: [] as string[],
	kinds: [] as string[],
	legalAreas: [] as string[],
	categories: [] as string[],
};

export const financialOverviewSearchSchema = z
	.object({
		dateFrom: z.string().catch(defaultDateFrom).default(defaultDateFrom),
		dateTo: z.string().catch(defaultDateTo).default(defaultDateTo),
		analytic: z.string().catch("").default(""),
		paymentMethods: z.array(z.string().trim()).catch([]).default([]),
		kinds: z.array(z.string().trim()).catch([]).default([]),
		legalAreas: z.array(z.string().trim()).catch([]).default([]),
		categories: z.array(z.string().trim()).catch([]).default([]),
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

export type FinancialOverviewSearch = z.infer<
	typeof financialOverviewSearchSchema
>;
