import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";
import { validateClientDocumentBusinessRules } from "../utils/validation";

const clientBaseInputSchema = z.object({
  fullName: z.string().trim().min(1, "Nome é obrigatório"),
  document: z.string().trim().min(1, "Documento é obrigatório"),
  email: z.email("Email inválido").optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  type: z.string().min(1, "Tipo de cliente é obrigatório"),
  isActive: z.boolean(),
});

const clientBusinessRulesRefinement = (
  data: ClientBaseInput,
  ctx: z.RefinementCtx,
) => {
  const issues = validateClientDocumentBusinessRules(data);

  for (const issue of issues) {
    ctx.addIssue({
      code: "custom",
      message: issue.message,
      path: issue.path,
    });
  }
};

export const clientCreateInputSchema = clientBaseInputSchema.superRefine(
  clientBusinessRulesRefinement,
);

export const clientUpdateInputSchema = entityIdSchema
  .safeExtend(clientBaseInputSchema.shape)
  .superRefine(clientBusinessRulesRefinement);

export const clientIdInputSchema = entityIdSchema;

export type ClientBaseInput = z.infer<typeof clientBaseInputSchema>;
export type ClientCreateInput = z.infer<typeof clientCreateInputSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateInputSchema>;
export type ClientIdInput = z.infer<typeof clientIdInputSchema>;
