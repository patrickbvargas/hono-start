import * as z from "zod";
import { dashboardSearchSchema } from "./search";

const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
export const dashboardDrilldownSelectionSchema = z.discriminatedUnion("kind", [
	z.object({
		kind: z.literal("metric"),
		value: z.enum(["planned", "revenue", "remuneration", "expense", "result"]),
	}),
	z.object({
		kind: z.literal("monthly"),
		month,
		series: z.enum(["revenue", "remuneration", "expense", "result", "output"]),
		revenueType: z
			.enum(["ADMINISTRATIVE", "JUDICIAL", "SUCCUMBENCY"])
			.optional(),
	}),
	z.object({
		kind: z.literal("area"),
		value: z.string().min(1),
		series: z.enum(["revenue", "remuneration"]).optional(),
	}),
	z.object({
		kind: z.literal("type"),
		value: z.string().min(1),
		series: z.enum(["revenue", "remuneration"]).optional(),
	}),
	z.object({ kind: z.literal("client"), value: z.string().regex(/^\d+$/) }),
	z.object({ kind: z.literal("function"), value: z.string().min(1) }),
	z.object({
		kind: z.literal("employee-month"),
		employeeId: z.number().int().positive(),
		month: month.optional(),
	}),
	z.object({ kind: z.literal("expense"), value: z.string().min(1) }),
	z.object({
		kind: z.literal("aging"),
		value: z.enum([
			"Até 30 dias",
			"31–60 dias",
			"61–90 dias",
			"Acima de 90 dias",
		]),
	}),
	z.object({
		kind: z.literal("forecast"),
		value: z.enum(["Próximos 30 dias", "31–60 dias", "61–90 dias"]),
	}),
]);
export type DashboardDrilldownSelection = z.infer<
	typeof dashboardDrilldownSelectionSchema
>;
export const dashboardDrilldownInputSchema = z.object({
	selection: dashboardDrilldownSelectionSchema,
	search: dashboardSearchSchema,
	referenceAt: z.iso.datetime(),
});
export type DashboardDrilldownInput = z.infer<
	typeof dashboardDrilldownInputSchema
>;
export const dashboardDrilldownRowSchema = z.object({
	id: z.string(),
	date: z.iso.datetime(),
	kind: z.string(),
	description: z.string(),
	client: z.string().optional(),
	process: z.string().optional(),
	type: z.string().optional(),
	employee: z.string().optional(),
	assignment: z.string().optional(),
	category: z.string().optional(),
	installment: z.number().optional(),
	faceAmount: z.number().optional(),
	paid: z.number().optional(),
	amount: z.number(),
});
export type DashboardDrilldownRow = z.infer<typeof dashboardDrilldownRowSchema>;
export const dashboardDrilldownResultSchema = z.object({
	data: z.array(dashboardDrilldownRowSchema),
	total: z.number().int().nonnegative(),
	amount: z.number(),
	entries: z.number(),
	deductions: z.number(),
});

export type DashboardDrilldownResult = z.infer<
	typeof dashboardDrilldownResultSchema
>;
