import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";

export const employeeCreateSchema = z.object({
	fullName: z.string().min(1, "Nome é obrigatório"),
	email: z.email("Email inválido"),
	oabNumber: z
		.string()
		.regex(/^RS\d{6}$/, "Formato OAB inválido (ex: RS123456)")
		.optional()
		.or(z.literal("")),
	remunerationPercent: z.coerce
		.number<number>()
		.min(0.01, "Percentual deve ser maior que 0%")
		.max(1, "Percentual não pode exceder 100%"),
	referrerPercent: z.coerce
		.number<number>()
		.min(0.01, "Percentual deve ser maior que 0%")
		.max(1, "Percentual não pode exceder 100%"),
	type: z.coerce.number<number>().min(1, "Função é obrigatória"),
	role: z.coerce.number<number>().min(1, "Cargo é obrigatório"),
});

export const employeeUpdateSchema = entityIdSchema.extend(
	employeeCreateSchema.shape,
);

export const employeeDeleteSchema = entityIdSchema;

export type EmployeeCreate = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdate = z.infer<typeof employeeUpdateSchema>;
export type EmployeeDelete = z.infer<typeof employeeDeleteSchema>;
