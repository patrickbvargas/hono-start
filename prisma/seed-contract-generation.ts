import type { SeedTransaction } from "./seed-financial-fixtures.js";
import { SEED_MARKER } from "./seed-financial-fixtures.js";

export async function seedContractGeneration(tx: SeedTransaction) {
	const marker = await tx.auditLog.findFirst({ where: { entityType: "Seed", entityId: SEED_MARKER }, select: { id: true } });
	if (!marker) {
		throw new Error("Contrato de teste exige banco demonstrativo com marcador do seed. Nenhum dado foi removido.");
	}
	const [status, area, revenueType, assignmentType, customer, employees, firms] = await Promise.all([
		tx.contractStatus.findUniqueOrThrow({ where: { value: "ACTIVE" } }),
		tx.legalArea.findUniqueOrThrow({ where: { value: "CIVIL" } }),
		tx.revenueType.findUniqueOrThrow({ where: { value: "ADMINISTRATIVE" } }),
		tx.assignmentType.findUniqueOrThrow({ where: { value: "RESPONSIBLE" } }),
		tx.clientProfile.findFirstOrThrow({ where: { isActive: true, person: { isActive: true, deletedAt: null, isGeneric: false } }, orderBy: { id: "asc" } }),
		tx.employeeProfile.findMany({ where: { isActive: true, deletedAt: null, employeeType: { value: "LAWYER" }, person: { isActive: true, deletedAt: null } }, select: { id: true }, orderBy: { id: "asc" } }),
		tx.firm.findMany({ where: { id: { in: [1, 2] } }, select: { id: true }, orderBy: { id: "asc" } }),
	]);
	if (!employees.length) { throw new Error("Seed exige ao menos um advogado ativo."); }
	const result = [];
	for (const firm of firms) {
		const processNumber = `DEMO-${firm.id}-GERAR-PARCELAS`;
		const existing = await tx.contract.findUnique({ where: { firmId_processNumber: { firmId: firm.id, processNumber } }, select: { id: true } });
		if (!existing) {
		const created = await tx.contract.create({ data: {
			firmId: firm.id, processNumber, customerId: customer.id, statusId: status.id, legalAreaId: area.id, feePercentage: "0.3000",
			notes: "Teste de geração: abra Financeiro e clique em Gerar parcelas. Receita de R$ 1.000,00, sem títulos prévios.",
		} });
		await tx.contractAssignment.createMany({ data: employees.map((employee) => ({ firmId: firm.id, contractId: created.id, employeeProfileId: employee.id, assignmentTypeId: assignmentType.id })) });
		await tx.revenue.create({ data: { firmId: firm.id, contractId: created.id, revenueTypeId: revenueType.id, negotiatedAmount: "1000.00", notes: "Receita disponível para testar geração de parcelas." } });
		}
		const contract = await tx.contract.findUniqueOrThrow({
			where: { firmId_processNumber: { firmId: firm.id, processNumber } },
			select: { id: true, firmId: true, processNumber: true, revenues: { select: { id: true, negotiatedAmount: true, _count: { select: { contractRevenueReceivables: true } } } } },
		});
		result.push(contract);
	}
	return result;
}
