import type { Mask, Options } from "use-mask-input";

export type BuiltInInputMaskKind = "cpf" | "cnpj" | "phoneBr";

interface InputMaskDefinition {
	mask: Mask;
	maxLength: number;
	options?: Options;
}

const INPUT_MASK_DEFINITIONS: Record<
	BuiltInInputMaskKind,
	InputMaskDefinition
> = {
	cpf: {
		mask: "999.999.999-99",
		maxLength: 14,
	},
	cnpj: {
		mask: "99.999.999/9999-99",
		maxLength: 18,
	},
	phoneBr: {
		mask: ["(99) 9999-9999", "(99) 99999-9999"],
		maxLength: 15,
	},
};

export function getBuiltInInputMaskDefinition(maskKind: BuiltInInputMaskKind) {
	return INPUT_MASK_DEFINITIONS[maskKind];
}
