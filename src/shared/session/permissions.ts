export const sessionPermissionEntities = [
	"employee",
	"client",
	"contract",
	"fee",
	"expense",
	"remuneration",
	"attachment",
	"dashboard",
	"audit-log",
] as const;

export const sessionPermissionActions = [
	"manage",
	"create",
	"update",
	"delete",
	"restore",
	"view",
	"assign-employee",
	"export",
	"upload",
] as const;

export type SessionPermissionEntity =
	(typeof sessionPermissionEntities)[number];
export type SessionPermissionAction = (typeof sessionPermissionActions)[number];
export type SessionPermission =
	`${SessionPermissionEntity}.${SessionPermissionAction}`;

export const sessionPermissions = [
	"employee.manage",
	"client.create",
	"client.update",
	"client.delete",
	"client.restore",
	"contract.view",
	"contract.create",
	"contract.update",
	"contract.delete",
	"contract.restore",
	"contract.assign-employee",
	"fee.create",
	"fee.update",
	"fee.view",
	"fee.delete",
	"fee.restore",
	"expense.create",
	"expense.update",
	"expense.view",
	"expense.delete",
	"expense.restore",
	"remuneration.view",
	"remuneration.update",
	"remuneration.delete",
	"remuneration.restore",
	"remuneration.export",
	"attachment.view",
	"attachment.upload",
	"attachment.delete",
	"dashboard.view",
	"audit-log.view",
] as const satisfies readonly SessionPermission[];

export type SessionAction = (typeof sessionPermissions)[number];

type SessionActionPolicyKind =
	| "authenticated"
	| "admin-only"
	| "assigned-read"
	| "assigned-contract-write"
	| "assigned-fee-write"
	| "own-remuneration";

interface SessionActionPolicyDefinition {
	deniedMessage: string;
	kind: SessionActionPolicyKind;
}

export const sessionActionPolicies: Record<
	SessionAction,
	SessionActionPolicyDefinition
> = {
	"attachment.delete": {
		deniedMessage: "Apenas administradores podem excluir anexos",
		kind: "admin-only",
	},
	"attachment.upload": {
		deniedMessage: "Você não tem permissão para enviar anexos",
		kind: "authenticated",
	},
	"attachment.view": {
		deniedMessage: "Você não tem permissão para visualizar este anexo",
		kind: "authenticated",
	},
	"audit-log.view": {
		deniedMessage: "Apenas administradores podem visualizar o audit log",
		kind: "admin-only",
	},
	"client.create": {
		deniedMessage: "Você não tem permissão para criar clientes",
		kind: "authenticated",
	},
	"client.delete": {
		deniedMessage: "Apenas administradores podem excluir clientes",
		kind: "admin-only",
	},
	"client.restore": {
		deniedMessage: "Apenas administradores podem restaurar clientes",
		kind: "admin-only",
	},
	"client.update": {
		deniedMessage: "Você não tem permissão para editar clientes",
		kind: "authenticated",
	},
	"contract.assign-employee": {
		deniedMessage:
			"Você não tem permissão para alterar a equipe deste contrato",
		kind: "assigned-contract-write",
	},
	"contract.create": {
		deniedMessage: "Você não tem permissão para criar contratos",
		kind: "authenticated",
	},
	"contract.delete": {
		deniedMessage: "Apenas administradores podem excluir contratos",
		kind: "admin-only",
	},
	"contract.restore": {
		deniedMessage: "Apenas administradores podem restaurar contratos",
		kind: "admin-only",
	},
	"contract.update": {
		deniedMessage: "Você não tem permissão para editar este contrato",
		kind: "assigned-contract-write",
	},
	"contract.view": {
		deniedMessage: "Você não tem permissão para visualizar este contrato",
		kind: "assigned-read",
	},
	"dashboard.view": {
		deniedMessage: "Você não tem permissão para visualizar o dashboard",
		kind: "authenticated",
	},
	"employee.manage": {
		deniedMessage: "Apenas administradores podem gerenciar colaboradores",
		kind: "admin-only",
	},
	"fee.create": {
		deniedMessage: "Você não tem permissão para criar honorários",
		kind: "assigned-fee-write",
	},
	"fee.delete": {
		deniedMessage: "Apenas administradores podem excluir honorários",
		kind: "admin-only",
	},
	"fee.restore": {
		deniedMessage: "Apenas administradores podem restaurar honorários",
		kind: "admin-only",
	},
	"fee.update": {
		deniedMessage: "Você não tem permissão para editar este honorário",
		kind: "assigned-fee-write",
	},
	"fee.view": {
		deniedMessage: "Você não tem permissão para visualizar estes honorários",
		kind: "assigned-read",
	},
	"expense.create": {
		deniedMessage: "Apenas administradores podem criar despesas",
		kind: "admin-only",
	},
	"expense.delete": {
		deniedMessage: "Apenas administradores podem excluir despesas",
		kind: "admin-only",
	},
	"expense.restore": {
		deniedMessage: "Apenas administradores podem restaurar despesas",
		kind: "admin-only",
	},
	"expense.update": {
		deniedMessage: "Apenas administradores podem editar despesas",
		kind: "admin-only",
	},
	"expense.view": {
		deniedMessage: "Apenas administradores podem visualizar despesas",
		kind: "admin-only",
	},
	"remuneration.delete": {
		deniedMessage: "Apenas administradores podem excluir remunerações",
		kind: "admin-only",
	},
	"remuneration.export": {
		deniedMessage: "Você não tem permissão para exportar estas remunerações",
		kind: "own-remuneration",
	},
	"remuneration.restore": {
		deniedMessage: "Apenas administradores podem restaurar remunerações",
		kind: "admin-only",
	},
	"remuneration.update": {
		deniedMessage: "Apenas administradores podem editar remunerações",
		kind: "admin-only",
	},
	"remuneration.view": {
		deniedMessage: "Você não tem permissão para visualizar esta remuneração",
		kind: "own-remuneration",
	},
};
