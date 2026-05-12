import { describe, expect, it } from "vitest";
import type { Option } from "@/shared/schemas/option";
import {
	getContractEditOptionDefaults,
	mergeLegacyContractOption,
} from "../utils/edit-options";

describe("contract edit options", () => {
	it("creates disabled fallback options for persisted inactive selections", () => {
		const defaults = getContractEditOptionDefaults({
			id: 10,
			processNumber: "PROC-10",
			clientId: 3,
			client: "Cliente legado",
			lawyer: "Colaborador legado",
			legalAreaId: 1,
			legalArea: "Previdenciario",
			legalAreaValue: "SOCIAL_SECURITY",
			statusId: 2,
			status: "Ativo",
			statusValue: "ACTIVE",
			feePercentage: 0.3,
			notes: null,
			allowStatusChange: true,
			assignments: [
				{
					id: 91,
					employeeId: 7,
					employeeName: "Colaborador legado",
					employeeType: "Advogado",
					employeeTypeValue: "LAWYER",
					assignmentType: "Responsavel",
					assignmentTypeValue: "RESPONSIBLE",
					isActive: false,
					isSoftDeleted: false,
				},
			],
			revenues: [],
			assignmentCount: 1,
			revenueCount: 0,
			assignedEmployeeIds: [],
			isAssignedToActor: true,
			isActive: true,
			isSoftDeleted: false,
			createdAt: "2026-01-01T00:00:00.000Z",
			updatedAt: "2026-01-02T00:00:00.000Z",
		});

		expect(defaults.currentClient).toEqual({
			id: 3,
			value: "3",
			label: "Cliente legado",
			isDisabled: true,
		});
		expect(defaults.currentEmployees).toEqual([
			{
				id: 7,
				value: "7",
				label: "Colaborador legado",
				isDisabled: true,
			},
		]);
	});

	it("appends a missing legacy option without duplicating existing values", () => {
		const activeOptions: Option[] = [
			{ id: 1, value: "1", label: "Ativo", isDisabled: false },
		];
		const legacyOption: Option = {
			id: 2,
			value: "2",
			label: "Legado",
			isDisabled: true,
		};

		expect(mergeLegacyContractOption(activeOptions, legacyOption)).toEqual([
			activeOptions[0],
			legacyOption,
		]);
		expect(mergeLegacyContractOption(activeOptions, activeOptions[0])).toEqual(
			activeOptions,
		);
	});
});
