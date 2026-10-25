import * as z from "zod";
import { formatter } from "@/shared/lib/formatter";
import type { ContractDetail } from "../schemas/model";

const workspaceAlertSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	severity: z.enum(["high", "medium", "low"]),
	tab: z.enum(["finance", "team"]),
});

export function getContractWorkspaceAlerts(
	contract: ContractDetail,
	today: string,
) {
	const alerts: z.infer<typeof workspaceAlertSchema>[] = [];
	const revenues = contract.revenues.filter(
		(r) => r.isActive && !r.isSoftDeleted,
	);
	for (const revenue of revenues) {
		if (revenue.isFullyPaid || revenue.remainingValue <= 0) {
			continue;
		}
		const overdue = Boolean(revenue.nextDueDate && revenue.nextDueDate < today);
		alerts.push({
			id: `revenue-${revenue.id}`,
			title: `${revenue.type}: ${overdue ? "vencimento em atraso" : "saldo a receber"}`,
			description: `${revenue.nextDueDate ? `Próximo vencimento em aberto: ${formatter.calendarDate(revenue.nextDueDate)}. ` : ""}Saldo total a receber: ${formatter.currency(revenue.remainingValue)}${overdue ? " (inclui parcelas futuras, quando houver)" : ""}.`,
			severity: overdue ? "high" : "low",
			tab: "finance",
		});
	}
	if (revenues.length === 0) {
		alerts.push({
			id: "no-revenues",
			title: "Sem receitas ativas",
			description: "Confira o cadastro das receitas deste contrato.",
			severity: "medium",
			tab: "finance",
		});
	}
	if (
		!contract.assignments.some(
			(a) =>
				a.isActive &&
				!a.isSoftDeleted &&
				a.assignmentTypeValue === "RESPONSIBLE",
		)
	) {
		alerts.push({
			id: "no-responsible",
			title: "Sem responsável na equipe",
			description:
				"Confira os colaboradores e suas atribuições neste contrato.",
			severity: "medium",
			tab: "team",
		});
	}
	return z
		.array(workspaceAlertSchema)
		.parse(alerts)
		.sort(
			(a, b) =>
				({ high: 0, medium: 1, low: 2 })[a.severity] -
				{ high: 0, medium: 1, low: 2 }[b.severity],
		);
}
