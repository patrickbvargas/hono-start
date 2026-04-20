import { describe, expect, it } from "vitest";
import { contractDetailSchema, contractSummarySchema } from "../schemas/model";

describe("contract model schemas", () => {
	it("accepts a summary payload without aggregate arrays", () => {
		const result = contractSummarySchema.safeParse({
			id: 1,
			processNumber: "PROC-001",
			clientId: 10,
			client: "Cliente",
			legalAreaId: 20,
			legalArea: "Cível",
			legalAreaValue: "CIVIL",
			statusId: 30,
			status: "Ativo",
			statusValue: "ACTIVE",
			feePercentage: 0.3,
			assignmentCount: 2,
			revenueCount: 1,
			assignedEmployeeIds: [5, 6],
			isAssignedToActor: true,
			isActive: true,
			isSoftDeleted: false,
			createdAt: "2026-01-01T00:00:00.000Z",
			updatedAt: "2026-01-02T00:00:00.000Z",
		});

		expect(result.success).toBe(true);
	});

	it("requires assignments and revenues on detail payloads", () => {
		const result = contractDetailSchema.safeParse({
			id: 1,
			processNumber: "PROC-001",
			clientId: 10,
			client: "Cliente",
			legalAreaId: 20,
			legalArea: "Cível",
			legalAreaValue: "CIVIL",
			statusId: 30,
			status: "Ativo",
			statusValue: "ACTIVE",
			feePercentage: 0.3,
			assignmentCount: 2,
			revenueCount: 1,
			assignedEmployeeIds: [5, 6],
			isAssignedToActor: true,
			isActive: true,
			isSoftDeleted: false,
			createdAt: "2026-01-01T00:00:00.000Z",
			updatedAt: "2026-01-02T00:00:00.000Z",
			notes: null,
			allowStatusChange: true,
		});

		expect(result.success).toBe(false);
	});
});
