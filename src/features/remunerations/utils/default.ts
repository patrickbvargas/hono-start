import type { RemunerationUpdateInput } from "../schemas/form";
import type { Remuneration } from "../schemas/model";

export const defaultRemunerationUpdateValues = (
	remuneration: Remuneration,
): RemunerationUpdateInput => ({
	id: remuneration.id,
	amount: remuneration.amount,
	effectivePercentage: remuneration.effectivePercentage,
});
