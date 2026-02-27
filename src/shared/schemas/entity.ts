import * as z from "zod";

export const entityIdSchema = z.object({
	id: z.string().min(1, "ID é obrigatório"),
});

export type EntityId = z.infer<typeof entityIdSchema>;
