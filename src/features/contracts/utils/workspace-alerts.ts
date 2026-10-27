import * as z from "zod";
import type { ContractDetail } from "../schemas/model";

const workspaceAlertSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	dueDate: z.string().nullable().default(null),
	overdueDays: z.number().int().nonnegative().nullable().default(null),
	remainingAmount: z.number().nonnegative().nullable().default(null),
	severity: z.enum(["high", "medium", "low"]),
	tab: z.enum(["finance", "team"]),
});

export function getContractWorkspaceAlerts(
	contract: ContractDetail,
	today: string,
	canReadFinancial = true,
) {
	const alerts: z.infer<typeof workspaceAlertSchema>[] = [];
	if (contract.isSoftDeleted || !canReadFinancial) {
		return alerts;
	}
	const revenues = contract.revenues.filter(
		(r) => r.isActive && !r.isSoftDeleted,
	);
	const operational = contract.isActive && contract.statusValue === "ACTIVE";
	const horizon = new Date(`${today}T12:00:00Z`);
	horizon.setUTCDate(horizon.getUTCDate() + 7);
	const upcomingUntil = horizon.toISOString().slice(0, 10);
	for (const revenue of revenues) {
		if (revenue.isFullyPaid || revenue.remainingValue <= 0) {
			continue;
		}
		if (revenue.installmentsPaid >= revenue.totalInstallments) {
			alerts.push({
				id: `balance-${revenue.id}`,
				title: `${revenue.type}: saldo após a última parcela`,
				description:
					"Todas as parcelas estão registradas, mas ainda há saldo a receber. Confira os recebimentos e revise o plano.",
				dueDate: null,
				overdueDays: null,
				remainingAmount: revenue.remainingValue,
				severity: "high",
				tab: "finance",
			});
			continue;
		}
		if (!revenue.nextDueDate) {
			continue;
		}
		if (revenue.nextDueDate < today) {
			alerts.push({
				id: `revenue-${revenue.id}`,
				title: `${revenue.type}: vencimento em atraso`,
				description:
					"Confira o recebimento em atraso. O saldo inclui parcelas futuras, quando houver.",
				dueDate: revenue.nextDueDate,
				overdueDays: Math.floor(
					(Date.parse(`${today}T00:00:00Z`) -
						Date.parse(`${revenue.nextDueDate}T00:00:00Z`)) /
						86400000,
				),
				remainingAmount: revenue.remainingValue,
				severity: "high",
				tab: "finance",
			});
		} else if (operational && revenue.nextDueDate <= upcomingUntil) {
			alerts.push({
				id: `upcoming-${revenue.id}`,
				title: `${revenue.type}: vencimento próximo`,
				description:
					"Confira a cobrança prevista para os próximos 7 dias (inclui hoje).",
				dueDate: revenue.nextDueDate,
				overdueDays: null,
				remainingAmount: revenue.remainingValue,
				severity: "medium",
				tab: "finance",
			});
		}
	}
	if (
		operational &&
		revenues.length > 0 &&
		revenues.every((r) => r.isFullyPaid || r.remainingValue <= 0)
	) {
		alerts.push({
			id: "settled-active",
			dueDate: null,
			overdueDays: null,
			remainingAmount: null,
			title: "Contrato quitado: revisar andamento",
			description:
				"Todas as receitas ativas estão quitadas. Confira se o contrato deve ser concluído; manter o andamento ativo pode ser uma decisão intencional.",
			severity: "low",
			tab: "finance",
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
