import type * as z from "zod";
import { optionSchema } from "@/shared/schemas/option";

export const LAWYER_TYPE_VALUE = "LAWYER";

export const employeeTypeSchema = optionSchema.transform((data) => ({
	...data,
	isLawyer: data.value === LAWYER_TYPE_VALUE,
}));

export type EmployeeType = z.infer<typeof employeeTypeSchema>;
