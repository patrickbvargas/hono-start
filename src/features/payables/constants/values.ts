export const PAYABLE_READ_PERMISSIONS = [
	"org:payables:read_all",
	"org:payables:read_own",
] as const;
export const PAYABLE_KINDS = [
	{ value: "DOWN_PAYMENT", label: "Entrada" },
	{ value: "INSTALLMENT", label: "Parcela" },
	{ value: "EXTRA", label: "Extra" },
];
export const PAYABLE_STATES = [
	{ value: "pending", label: "Pendente" },
	{ value: "overdue", label: "Em atraso" },
	{ value: "partial", label: "Parcial" },
	{ value: "settled", label: "Quitado" },
	{ value: "cancelled", label: "Cancelado" },
];
export const PAYABLE_ORIGINS = [
	{ value: "expense", label: "Despesa" },
	{ value: "remuneration", label: "Remuneração" },
	{ value: "direct", label: "Direto" },
];
