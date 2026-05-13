import type { Mask, Options } from "use-mask-input";

export type BuiltInInputMaskKind = "cpf" | "cnpj" | "phoneBr";

interface InputMaskDefinition {
	mask: Mask;
	maxLength: number;
	options?: Options;
}

const DEFAULT_INPUT_MASK_OPTIONS: Options = {
	placeholder: "_",
	showMaskOnHover: false,
	showMaskOnFocus: true,
};

const INPUT_MASK_DEFINITIONS: Record<
	BuiltInInputMaskKind,
	InputMaskDefinition
> = {
	cpf: {
		mask: "999.999.999-99",
		maxLength: 14,
		options: DEFAULT_INPUT_MASK_OPTIONS,
	},
	cnpj: {
		mask: "99.999.999/9999-99",
		maxLength: 18,
		options: DEFAULT_INPUT_MASK_OPTIONS,
	},
	phoneBr: {
		mask: ["(99) 9999-9999", "(99) 99999-9999"],
		maxLength: 15,
		options: DEFAULT_INPUT_MASK_OPTIONS,
	},
};

export function getBuiltInInputMaskDefinition(maskKind: BuiltInInputMaskKind) {
	return INPUT_MASK_DEFINITIONS[maskKind];
}
