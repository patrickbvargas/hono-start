import { describe, expect, it } from "vitest";
import {
	assertCan,
	CONTRACT_STATUS_ACTIVE_VALUE,
	CONTRACT_STATUS_CANCELLED_VALUE,
	type ContractAccessResource,
	can,
	type FeeAccessResource,
	type LoggedUserSession,
	SESSION_ADMIN_ROLE_VALUE,
	SESSION_USER_ROLE_VALUE,
	type SessionAction,
} from "@/shared/session";

function createSession(
	overrides: Partial<LoggedUserSession> = {},
): LoggedUserSession {
	return {
		user: {
			id: 1,
			fullName: "Amanda Admin",
			email: "amanda@example.com",
			...overrides.user,
		},
		employee: {
			id: 10,
			...overrides.employee,
		},
		firm: {
			id: 100,
			name: "Matriz",
			...overrides.firm,
		},
		employeeType: {
			id: 1,
			value: "LAWYER",
			label: "Advogado",
			...overrides.employeeType,
		},
		role: {
			id: 1,
			value: SESSION_ADMIN_ROLE_VALUE,
			label: "Administrador",
			...overrides.role,
		},
	};
}

const adminSession = createSession();
const userSession = createSession({
	role: {
		id: 2,
		value: SESSION_USER_ROLE_VALUE,
		label: "Usuário",
	},
});

const allActions: SessionAction[] = [
	"employee.manage",
	"employee.update",
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
];

const authenticatedActions: SessionAction[] = [
	"attachment.view",
	"attachment.upload",
	"client.create",
	"client.update",
	"contract.create",
	"dashboard.view",
];

const adminOnlyActions: SessionAction[] = [
	"employee.manage",
	"client.delete",
	"client.restore",
	"contract.delete",
	"contract.restore",
	"fee.delete",
	"fee.restore",
	"remuneration.update",
	"remuneration.delete",
	"remuneration.restore",
	"attachment.delete",
	"audit-log.view",
];

function createContractResource(
	overrides: Partial<ContractAccessResource> = {},
): ContractAccessResource {
	return {
		firmId: 100,
		assignedEmployeeIds: [10],
		statusValue: CONTRACT_STATUS_ACTIVE_VALUE,
		...overrides,
	};
}

function createFeeResource(
	overrides: Partial<FeeAccessResource> = {},
): FeeAccessResource {
	return {
		firmId: 100,
		assignedEmployeeIds: [10],
		statusValue: CONTRACT_STATUS_ACTIVE_VALUE,
		...overrides,
	};
}

describe("session authorization policy", () => {
	it("allows administrators through the central action policy", () => {
		for (const action of allActions) {
			expect(can(adminSession, action, { firmId: 100 })).toBe(true);
		}
	});

	it("denies cross-firm resources before role-specific decisions", () => {
		expect(can(adminSession, "employee.manage", { firmId: 200 })).toBe(false);
		expect(can(userSession, "client.update", { firmId: 200 })).toBe(false);
		expect(
			can(
				userSession,
				"contract.view",
				createContractResource({ firmId: 200 }),
			),
		).toBe(false);
	});

	it("allows regular users to perform shared authenticated actions", () => {
		for (const action of authenticatedActions) {
			expect(can(userSession, action, { firmId: 100 })).toBe(true);
		}
	});

	it("denies administrator-only actions for regular users", () => {
		for (const action of adminOnlyActions) {
			expect(can(userSession, action, { firmId: 100 })).toBe(false);
		}
	});

	it("allows regular users to update only their own employee profile", () => {
		expect(
			can(userSession, "employee.update", { firmId: 100, employeeId: 10 }),
		).toBe(true);
		expect(
			can(userSession, "employee.update", { firmId: 100, employeeId: 11 }),
		).toBe(false);
	});

	it("allows regular users to access assigned contracts and fees", () => {
		expect(can(userSession, "contract.view", createContractResource())).toBe(
			true,
		);
		expect(can(userSession, "contract.update", createContractResource())).toBe(
			true,
		);
		expect(
			can(userSession, "contract.assign-employee", createContractResource()),
		).toBe(true);
		expect(can(userSession, "fee.view", createFeeResource())).toBe(true);
		expect(can(userSession, "fee.create", createFeeResource())).toBe(true);
		expect(can(userSession, "fee.update", createFeeResource())).toBe(true);
		expect(
			can(
				userSession,
				"contract.view",
				createContractResource({ assignedEmployeeIds: [11] }),
			),
		).toBe(false);
		expect(
			can(
				userSession,
				"fee.view",
				createFeeResource({ isAssignedToActor: false }),
			),
		).toBe(false);
	});

	it("allows regular users to access only their own remunerations", () => {
		expect(
			can(userSession, "remuneration.view", { firmId: 100, employeeId: 10 }),
		).toBe(true);
		expect(
			can(userSession, "remuneration.export", { firmId: 100, employeeId: 10 }),
		).toBe(true);
		expect(
			can(userSession, "remuneration.view", { firmId: 100, employeeId: 11 }),
		).toBe(false);
	});

	it("denies regular-user mutations on read-only contracts", () => {
		const readOnlyContract = createContractResource({
			statusValue: CONTRACT_STATUS_CANCELLED_VALUE,
		});
		const readOnlyFee = createFeeResource({
			statusValue: CONTRACT_STATUS_CANCELLED_VALUE,
		});

		expect(can(userSession, "contract.update", readOnlyContract)).toBe(false);
		expect(can(userSession, "contract.assign-employee", readOnlyContract)).toBe(
			false,
		);
		expect(can(userSession, "fee.create", readOnlyFee)).toBe(false);
		expect(can(userSession, "fee.update", readOnlyFee)).toBe(false);
	});

	it("keeps pt-BR denial messages on assertions", () => {
		expect(() =>
			assertCan(userSession, "audit-log.view", { firmId: 100 }),
		).toThrowError("Apenas administradores podem visualizar o audit log");
	});
});
