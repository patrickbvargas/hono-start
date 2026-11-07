import {
	SEED_MARKER,
	type SeedTransaction,
} from "./seed-financial-fixtures.js";

export async function seedExpenseGeneration(tx: SeedTransaction) {
	const marker = await tx.auditLog.findFirst({
		where: { entityType: "Seed", entityId: SEED_MARKER },
		select: { id: true },
	});
	if (!marker) {
		throw new Error(
			"Despesa de teste exige banco demonstrativo com marcador do seed. Nenhum dado foi removido.",
		);
	}
	const [supplier, firms] = await Promise.all([
		tx.supplierProfile.findFirstOrThrow({
			where: {
				isActive: true,
				person: { isActive: true, deletedAt: null, isGeneric: false },
			},
			select: { id: true, person: { select: { fullName: true } } },
			orderBy: { id: "asc" },
		}),
		tx.firm.findMany({
			where: { id: { in: [1, 2] } },
			select: { id: true, name: true },
			orderBy: { id: "asc" },
		}),
	]);
	if (!firms.length) {
		throw new Error("Seed exige ao menos uma filial demonstrativa (1 ou 2).");
	}
	const expenses = [];
	for (const firm of firms) {
		const notes = `DEMO-${firm.id}-DESPESA-GERAR-PARCELAS: teste de lançamento de títulos a pagar. Valor R$ 1.000,00. Abra Financeiro e clique em Gerar parcelas.`;
		const available = await tx.expense.findFirst({
			where: {
				firmId: firm.id,
				supplierId: supplier.id,
				notes,
				negotiatedAmount: "1000.00",
				isActive: true,
				deletedAt: null,
				expensePayables: { none: {} },
			},
			select: { id: true },
			orderBy: { id: "asc" },
		});
		let expense = available;
		if (!expense) {
			expense = await tx.expense.create({
				data: {
					firmId: firm.id,
					supplierId: supplier.id,
					negotiatedAmount: "1000.00",
					notes,
					isActive: true,
				},
				select: { id: true },
			});
			await tx.auditLog.create({
				data: {
					firmId: firm.id,
					actorName: "Seed demonstrativo",
					action: "CREATE",
					entityType: "Expense",
					entityId: String(expense.id),
					expenseId: expense.id,
					entityName: `${supplier.person.fullName} #${expense.id}`,
					description: `Criou despesa demonstrativa ${expense.id} para testar geração de parcelas.`,
					changeData: {
						after: {
							supplierId: supplier.id,
							negotiatedAmount: "1000.00",
							notes,
						},
					},
				},
			});
		}
		expenses.push({
			id: expense.id,
			firmId: firm.id,
			firm: firm.name,
			supplier: supplier.person.fullName,
			negotiatedAmount: "1000.00",
			url: `/despesas/${expense.id}?tab=financial`,
		});
	}
	return expenses;
}
