import type { Option } from "@/shared/schemas/option";
import type { FeeDetail } from "../schemas/model";

export interface FeeEditOptions {
	currentContract: Option;
	currentRevenue: Option;
}

export function mergeLegacyFeeOption(options: Option[], legacyOption?: Option) {
	if (!legacyOption) {
		return options;
	}

	if (options.some((option) => option.value === legacyOption.value)) {
		return options;
	}

	return [...options, legacyOption];
}

export function getFeeEditOptionDefaults(fee: FeeDetail): FeeEditOptions {
	return {
		currentContract: {
			id: fee.contractId,
			value: String(fee.contractId),
			label: `${fee.contractProcessNumber} • ${fee.client}`,
			isDisabled: true,
		},
		currentRevenue: {
			id: fee.revenueId,
			value: String(fee.revenueId),
			label: fee.revenueType,
			isDisabled: true,
		},
	};
}
