import { describe, expect, it } from "vitest";
import {
	assertCan,
	can,
	hasPermission,
	type LoggedUserSession,
} from "@/shared/session";
import { clerkPermissions } from "../schema";

function createSession(
	overrides: Partial<LoggedUserSession> = {},
): LoggedUserSession {
	return {
		permissions: [],
		clerk: {
			userId: "user_test",
			organizationId: "org_test",
			sessionId: "sess_test",
		},
		user: {
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
		...overrides,
	};
}

describe("Clerk-granted authorization", () => {
	it("checks exact keys and denies missing sessions without implied grants", () => {
		const session = createSession({
			permissions: ["org:clients:read", "org:contracts:read_all"],
		});
		expect(hasPermission(session, "org:clients:read")).toBe(true);
		expect(hasPermission(session, "org:clients:create")).toBe(false);
		expect(hasPermission(session, "org:contracts:read_assigned")).toBe(false);
		expect(hasPermission(null, "org:clients:read")).toBe(false);
		expect(hasPermission(undefined, "org:clients:read")).toBe(false);
	});
	it("denies operations without a Clerk grant", () => {
		expect(hasPermission(createSession(), "org:clients:create")).toBe(false);
		expect(() => assertCan(createSession(), "org:clients:create")).toThrow();
	});
	it("accepts the specific grant without implied CRUD", () => {
		const session = createSession({
			permissions: ["org:clients:read"],
		});
		expect(hasPermission(session, "org:clients:read")).toBe(true);
		expect(hasPermission(session, "org:clients:update")).toBe(false);
	});
	it("never bypasses firm isolation, including with every permission", () => {
		expect(
			can(
				createSession({ permissions: clerkPermissions }),
				["org:contracts:read_all", "org:contracts:read_assigned"],
				{
					firmId: 999,
				},
			),
		).toBe(false);
	});
	it("keeps assigned reads and writes independent", () => {
		const resource = {
			firmId: 100,
			statusValue: "ACTIVE",
			isAssignedToActor: true,
		};
		const session = createSession({
			permissions: ["org:contracts:read_assigned"],
		});
		expect(
			can(
				session,
				["org:contracts:read_all", "org:contracts:read_assigned"],
				resource,
			),
		).toBe(true);
		expect(
			can(session, ["org:contracts:read_all", "org:contracts:read_assigned"], {
				...resource,
				isAssignedToActor: false,
			}),
		).toBe(false);
		expect(
			can(
				session,
				["org:contracts:update_all", "org:contracts:update_assigned"],
				resource,
			),
		).toBe(false);
		session.permissions = ["org:contracts:update_assigned"];
		expect(
			can(
				session,
				["org:contracts:update_all", "org:contracts:update_assigned"],
				resource,
			),
		).toBe(true);
		expect(
			can(
				session,
				["org:contracts:update_all", "org:contracts:update_assigned"],
				{
					...resource,
					statusValue: "COMPLETED",
				},
			),
		).toBe(false);
	});
	it("limits own remuneration export independently of firm-wide read", () => {
		const session = createSession({
			permissions: [
				"org:remunerations:read_all",
				"org:remunerations:export_own",
			],
		});
		expect(
			can(
				session,
				["org:remunerations:read_all", "org:remunerations:read_own"],
				{ firmId: 100, employeeId: 20 },
			),
		).toBe(true);
		expect(
			can(
				session,
				["org:remunerations:export_all", "org:remunerations:export_own"],
				{ firmId: 100, employeeId: 20 },
			),
		).toBe(false);
		expect(
			can(
				session,
				["org:remunerations:export_all", "org:remunerations:export_own"],
				{ firmId: 100, employeeId: 10 },
			),
		).toBe(true);
	});
	it("fee reads never imply writing, even with an assignment", () => {
		const session = createSession({ permissions: ["org:fees:read_all"] });
		expect(
			can(session, "org:fees:create", {
				firmId: 100,
				statusValue: "ACTIVE",
				isAssignedToActor: true,
			}),
		).toBe(false);
	});
	it.each([
		"read_all",
		"create",
		"update",
		"cancel",
		"restore",
		"generate",
	] as const)(
		"keeps receivables and payables %s grants independent",
		(action) => {
			const incoming = createSession({
				permissions: [`org:receivables:${action}`],
			});
			const outgoing = createSession({
				permissions: [`org:payables:${action}`],
			});
			expect(can(incoming, `org:receivables:${action}`)).toBe(true);
			expect(can(incoming, `org:payables:${action}`)).toBe(false);
			expect(can(outgoing, `org:payables:${action}`)).toBe(true);
			expect(can(outgoing, `org:receivables:${action}`)).toBe(false);
		},
	);
	it("separates title access from settlement operations", () => {
		const session = createSession({
			permissions: ["org:receivables:read_all", "org:payables:read_all"],
		});
		expect(can(session, "org:receipts:create")).toBe(false);
		expect(can(session, "org:payments:create")).toBe(false);
		expect(can(session, "org:receivables:update")).toBe(false);
	});
	it("restricts own payable access to beneficiary and assigned originating contract", () => {
		const session = createSession({
			person: { id: 900 },
			permissions: ["org:payables:read_own"],
		});
		const resource = {
			firmId: 100,
			beneficiaryId: 900,
			isRemuneration: true,
			contract: { firmId: 100, isAssignedToActor: true },
		};
		expect(can(session, "org:payables:read_own", resource)).toBe(true);
		expect(
			can(session, "org:payables:read_own", { ...resource, beneficiaryId: 10 }),
		).toBe(false);
		expect(
			can(session, "org:payables:read_own", {
				...resource,
				isRemuneration: false,
			}),
		).toBe(false);
		expect(
			can(session, "org:payables:read_own", {
				...resource,
				contract: { firmId: 100, isAssignedToActor: false },
			}),
		).toBe(false);
		expect(
			can(session, "org:payables:read_own", { ...resource, firmId: 200 }),
		).toBe(false);
	});
	it("receipt creation requires its own grant and readable contract scope, independently of operational status", () => {
		const resource = {
			firmId: 100,
			contract: {
				firmId: 100,
				isAssignedToActor: true,
				statusValue: "CANCELLED",
			},
		};
		const session = createSession({
			permissions: ["org:receipts:create", "org:receipts:read_assigned"],
		});
		expect(can(session, "org:receipts:create", resource)).toBe(true);
		expect(
			can(session, "org:receipts:create", {
				...resource,
				contract: { firmId: 100, isAssignedToActor: false },
			}),
		).toBe(false);
	});
});
