import { describe, expect, it } from "vitest";
import type { Option } from "@/shared/schemas/option";
import {
	getFeeEditOptionDefaults,
	mergeLegacyFeeOption,
} from "../utils/edit-options";

describe("fee edit options", () => {
	it("creates disabled fallback options for persisted inactive parent selections", () => {
		const defaults = getFeeEditOptionDefaults({
			id: 5,
			contractId: 11,
			contractProcessNumber: "PROC-11",
			client: "Cliente legado",
			contractStatusValue: "COMPLETED",
			revenueId: 19,
			revenueType: "Mensalidade",
			revenueTypeValue: "MONTHLY",
			paymentDate: "2026-04-15T00:00:00.000Z",
			amount: 1000,
			installmentNumber: 1,
			generatesRemuneration: true,
			remunerationCount: 0,
			isActive: true,
			isSoftDeleted: false,
			createdAt: "2026-04-15T00:00:00.000Z",
			updatedAt: "2026-04-16T00:00:00.000Z",
		});

		expect(defaults.currentContract).toEqual({
			id: 11,
			value: "11",
			label: "PROC-11 • Cliente legado",
			isDisabled: true,
		});
		expect(defaults.currentRevenue).toEqual({
			id: 19,
			value: "19",
			label: "Mensalidade",
			isDisabled: true,
		});
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

		expect(mergeLegacyFeeOption(activeOptions, legacyOption)).toEqual([
			activeOptions[0],
			legacyOption,
		]);
		expect(mergeLegacyFeeOption(activeOptions, activeOptions[0])).toEqual(
			activeOptions,
		);
	});
});
