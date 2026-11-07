export const RECEIVABLE_READ_PERMISSIONS = [
	"org:receivables:read_all",
	"org:receivables:read_assigned",
] as const;
export const RECEIVABLE_KINDS = [
	{ value: "DOWN_PAYMENT", label: "Entrada" },
	{ value: "INSTALLMENT", label: "Parcela" },
	{ value: "EXTRA", label: "Extra" },
];
export const RECEIVABLE_STATES = [
	{ value: "pending", label: "Pendente" },
	{ value: "overdue", label: "Em atraso" },
	{ value: "partial", label: "Parcial" },
	{ value: "settled", label: "Quitado" },
	{ value: "cancelled", label: "Cancelado" },
];
export const RECEIVABLE_ORIGINS = [
	{ value: "contract", label: "Contrato" },
	{ value: "direct", label: "Sem vínculo com contrato" },
];
