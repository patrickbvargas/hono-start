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
				description: `Todas as parcelas estão registradas, mas ainda há ${formatter.currency(revenue.remainingValue)} a receber. Confira os recebimentos e revise o plano.`,
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
				description: `Próximo vencimento em aberto: ${formatter.calendarDate(revenue.nextDueDate)}. Saldo total a receber: ${formatter.currency(revenue.remainingValue)} (inclui parcelas futuras, quando houver).`,
				severity: "high",
				tab: "finance",
			});
		} else if (operational && revenue.nextDueDate <= upcomingUntil) {
			alerts.push({
				id: `upcoming-${revenue.id}`,
				title: `${revenue.type}: vencimento próximo`,
				description: `Vencimento em aberto em ${formatter.calendarDate(revenue.nextDueDate)}. Confira a cobrança prevista para os próximos 7 dias (inclui hoje).`,
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
