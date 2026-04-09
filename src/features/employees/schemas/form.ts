import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";

const employeeBaseShape = {
	fullName: z.string().min(1, "Nome é obrigatório"),
	email: z.email("Email inválido"),
	oabNumber: z
		.string()
		.regex(/^[A-Z]{2}\d{6}$/, "Formato OAB inválido (ex: RS123456)")
		.optional()
		.or(z.literal("")),
	remunerationPercent: z.coerce
		.number<number>()
		.min(0, "Percentual deve ser maior ou igual a 0%")
		.max(1, "Percentual não pode exceder 100%"),
	referrerPercent: z.coerce
		.number<number>()
		.min(0, "Percentual deve ser maior ou igual a 0%")
		.max(1, "Percentual não pode exceder 100%"),
	type: z.coerce.number<number>().min(1, "Função é obrigatória"),
	role: z.coerce.number<number>().min(1, "Cargo é obrigatório"),
	isActive: z.boolean(),
};

const referrerRefinement = (
	data: { referrerPercent: number; remunerationPercent: number },
	ctx: z.RefinementCtx,
) => {
	if (data.referrerPercent > data.remunerationPercent) {
		ctx.addIssue({
			code: "custom",
			message:
				"Percentual de indicação não pode exceder o percentual de remuneração",
			path: ["referrerPercent"],
		});
	}
};

export const employeeCreateSchema = z
	.object(employeeBaseShape)
	.superRefine(referrerRefinement);

export const employeeUpdateSchema = entityIdSchema
	.safeExtend(employeeBaseShape)
	.superRefine(referrerRefinement);

export const employeeByIdSchema = entityIdSchema;

export type EmployeeCreate = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdate = z.infer<typeof employeeUpdateSchema>;
export type EmployeeById = z.infer<typeof employeeByIdSchema>;
