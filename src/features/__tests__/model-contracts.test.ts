import { describe, expect, it } from "vitest";
import { auditLogSchema } from "@/features/audit-logs/schemas/model";
import {
	contractDetailSchema,
	contractSummarySchema,
} from "@/features/contracts/schemas/model";

import {
	personDetailSchema,
	personSummarySchema,
} from "@/features/people/schemas/model";

const timestamp = "2026-01-01T00:00:00.000Z";

const personDetail = {
	id: 1,
	fullName: "Maria Teste",
	document: "52998224725",
	email: "maria@example.com",
	phone: "11999999999",
	typeId: 10,
	typeValue: "INDIVIDUAL",
	type: "Pessoa Física",
	contractCount: 2,
	isGeneric: false,
	roles: ["customer"],
	isCustomer: true,
	isSupplier: false,
	isEmployee: false,
	isActive: true,
	isSoftDeleted: false,
	createdAt: timestamp,
	updatedAt: timestamp,
};

const contractSummary = {
	id: 3,
	processNumber: "0001234-56.2026.8.26.0001",
	clientId: 1,
	client: "Maria Cliente",
	lawyer: "João Advogado",
	legalAreaId: 40,
	legalArea: "Previdenciário",
	legalAreaValue: "SOCIAL_SECURITY",
	statusId: 50,
	status: "Ativo",
	statusValue: "ACTIVE",
	feePercentage: 0.3,
	assignmentCount: 1,
	revenueCount: 1,
	assignedEmployeeIds: [2],
	isAssignedToActor: true,
	isActive: true,
	isSoftDeleted: false,
	createdAt: timestamp,
	updatedAt: timestamp,
};

const contractAssignment = {
	id: 4,
	employeeId: 2,
	employeeName: "João Advogado",
	employeeType: "Advogado",
	employeeTypeValue: "LAWYER",
	assignmentType: "Responsável",
	assignmentTypeValue: "RESPONSIBLE",
	isActive: true,
	isSoftDeleted: false,
};

const contractRevenue = {
	id: 5,
	typeId: 60,
	type: "Honorários contratuais",
	typeValue: "CONTRACTUAL",
	totalValue: 10000,
	downPaymentValue: 1000,
	paymentStartDate: timestamp,
	totalInstallments: 10,
	paidValue: 2000,
	installmentsPaid: 1,
	remainingValue: 8000,
	isFullyPaid: false,
	isActive: true,
	isSoftDeleted: false,
};

const auditLog = {
	id: 8,
	occurredAt: timestamp,
	occurredAtLabel: "01/01/2026, 00:00",
	actorName: "João Advogado",
	actorEmail: "joao@example.com",
	action: "CREATE",
	entityType: "Client",
	entityTypeLabel: "Cliente",
	entityName: "Maria Cliente",
	entityId: "1",
	ipAddress: null,
	userAgent: null,
	description: "criou cliente Maria Cliente.",
};

describe("feature model contracts", () => {
	it("accepts UI-ready list and detail models for principal entities", () => {
		expect(personSummarySchema.parse(personDetail)).toEqual({
			id: personDetail.id,
			fullName: personDetail.fullName,
			document: personDetail.document,
			type: personDetail.type,
			roles: personDetail.roles,
			isGeneric: personDetail.isGeneric,
			contractCount: personDetail.contractCount,
			isActive: personDetail.isActive,
			isSoftDeleted: personDetail.isSoftDeleted,
		});
		expect(personDetailSchema.parse(personDetail)).toEqual(personDetail);

		expect(contractSummarySchema.parse(contractSummary)).toEqual(
			contractSummary,
		);
		expect(
			contractDetailSchema.parse({
				...contractSummary,
				notes: null,
				allowStatusChange: true,
				assignments: [contractAssignment],
				revenues: [contractRevenue],
			}),
		).toMatchObject({
			id: contractSummary.id,
			assignments: [contractAssignment],
			revenues: [contractRevenue],
		});

		expect(auditLogSchema.parse(auditLog)).toEqual(auditLog);
	});

	it("rejects missing fields required by edit defaults and details views", () => {
		expect(() =>
			personDetailSchema.parse({
				...personDetail,
				typeValue: undefined,
			}),
		).toThrow();

		expect(() =>
			contractDetailSchema.parse({
				...contractSummary,
				notes: null,
				allowStatusChange: true,
				assignments: undefined,
				revenues: [contractRevenue],
			}),
		).toThrow();
	});
});
