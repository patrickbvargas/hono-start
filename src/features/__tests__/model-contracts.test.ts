import { describe, expect, it } from "vitest";
import { auditLogSchema } from "@/features/audit-logs/schemas/model";
import {
	clientDetailSchema,
	clientSummarySchema,
} from "@/features/clients/schemas/model";
import {
	contractDetailSchema,
	contractSummarySchema,
} from "@/features/contracts/schemas/model";
import {
	employeeDetailSchema,
	employeeSummarySchema,
} from "@/features/employees/schemas/model";
import { feeDetailSchema } from "@/features/fees/schemas/model";
import { remunerationSchema } from "@/features/remunerations/schemas/model";

const timestamp = "2026-01-01T00:00:00.000Z";

const clientDetail = {
	id: 1,
	fullName: "Maria Cliente",
	document: "52998224725",
	email: "maria@example.com",
	phone: "11999999999",
	typeId: 10,
	typeValue: "INDIVIDUAL",
	type: "Pessoa Física",
	contractCount: 2,
	isActive: true,
	isSoftDeleted: false,
	createdAt: timestamp,
	updatedAt: timestamp,
};

const employeeDetail = {
	id: 2,
	fullName: "João Advogado",
	email: "joao@example.com",
	oabNumber: "SP123456",
	remunerationPercent: 0.3,
	referrerPercent: 0.1,
	typeId: 20,
	roleId: 30,
	type: "Advogado",
	typeValue: "LAWYER",
	role: "Administrador",
	roleValue: "ADMIN",
	contractCount: 4,
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

const feeDetail = {
	id: 6,
	contractId: 3,
	contractProcessNumber: "0001234-56.2026.8.26.0001",
	client: "Maria Cliente",
	contractStatusValue: "ACTIVE",
	revenueId: 5,
	revenueType: "Honorários contratuais",
	revenueTypeValue: "CONTRACTUAL",
	paymentDate: timestamp,
	amount: 1000,
	installmentNumber: 1,
	generatesRemuneration: true,
	remunerationCount: 1,
	isActive: true,
	isSoftDeleted: false,
	createdAt: timestamp,
	updatedAt: timestamp,
};

const remuneration = {
	id: 7,
	contractEmployeeId: 4,
	employeeId: 2,
	employeeName: "João Advogado",
	client: "Maria Cliente",
	contractId: 3,
	contractProcessNumber: "0001234-56.2026.8.26.0001",
	feeId: 6,
	feeAmount: 1000,
	feeInstallmentNumber: 1,
	paymentDate: timestamp,
	amount: 300,
	effectivePercentage: 0.3,
	isManualOverride: false,
	isSystemGenerated: true,
	isActive: true,
	isSoftDeleted: false,
	parentFeeIsSoftDeleted: false,
	createdAt: timestamp,
	updatedAt: timestamp,
};

const auditLog = {
	id: 8,
	occurredAt: timestamp,
	actorName: "João Advogado",
	actorEmail: "joao@example.com",
	action: "CREATE",
	entityType: "Client",
	entityName: "Maria Cliente",
	entityId: "1",
	ipAddress: null,
	userAgent: null,
	description: "Created client Maria Cliente.",
};

describe("feature model contracts", () => {
	it("accepts UI-ready list and detail models for principal entities", () => {
		expect(clientSummarySchema.parse(clientDetail)).toEqual({
			id: clientDetail.id,
			fullName: clientDetail.fullName,
			document: clientDetail.document,
			type: clientDetail.type,
			contractCount: clientDetail.contractCount,
			isActive: clientDetail.isActive,
			isSoftDeleted: clientDetail.isSoftDeleted,
		});
		expect(clientDetailSchema.parse(clientDetail)).toEqual(clientDetail);

		expect(employeeSummarySchema.parse(employeeDetail)).toEqual({
			id: employeeDetail.id,
			fullName: employeeDetail.fullName,
			oabNumber: employeeDetail.oabNumber,
			remunerationPercent: employeeDetail.remunerationPercent,
			type: employeeDetail.type,
			role: employeeDetail.role,
			contractCount: employeeDetail.contractCount,
			isActive: employeeDetail.isActive,
			isSoftDeleted: employeeDetail.isSoftDeleted,
		});
		expect(employeeDetailSchema.parse(employeeDetail)).toEqual(employeeDetail);

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

		expect(feeDetailSchema.parse(feeDetail)).toEqual(feeDetail);
		expect(remunerationSchema.parse(remuneration)).toEqual(remuneration);
		expect(auditLogSchema.parse(auditLog)).toEqual(auditLog);
	});

	it("rejects missing fields required by edit defaults and details views", () => {
		expect(() =>
			clientDetailSchema.parse({
				...clientDetail,
				typeValue: undefined,
			}),
		).toThrow();

		expect(() =>
			employeeDetailSchema.parse({
				...employeeDetail,
				roleValue: undefined,
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

		expect(() =>
			feeDetailSchema.parse({
				...feeDetail,
				revenueTypeValue: undefined,
			}),
		).toThrow();

		expect(() =>
			remunerationSchema.parse({
				...remuneration,
				parentFeeIsSoftDeleted: undefined,
			}),
		).toThrow();
	});
});
