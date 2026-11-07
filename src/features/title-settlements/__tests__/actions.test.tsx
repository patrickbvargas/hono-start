// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { LoggedUserSession } from "@/shared/session";
import type { OverlayState } from "@/shared/types/overlay";

const state = vi.hoisted(() => ({ session: null as LoggedUserSession | null }));
vi.mock("@/shared/session", async (importOriginal) => ({
	...(await importOriginal<typeof import("@/shared/session")>()),
	useLoggedUserSession: () => state.session,
}));
vi.mock("../components/form", () => ({
	SettlementForm: ({
		state,
		target,
	}: {
		state: OverlayState;
		target: { direction: string; titleId: number };
	}) => (
		<div role="dialog" aria-label="Baixa">
			{target.direction} #{target.titleId}
			<button type="button" onClick={state.close}>
				Cancelar
			</button>
		</div>
	),
}));
vi.mock("../components/reversal", () => ({
	ReversalForm: ({ movementId }: { movementId: number }) => (
		<div role="dialog" aria-label="Estorno">
			Movimentação #{movementId}
		</div>
	),
}));

import {
	SettlementReversalAction,
	TitleSettlementAction,
} from "../components/actions";

function session(
	permissions: LoggedUserSession["permissions"],
): LoggedUserSession {
	return {
		permissions,
		firm: { id: 1, name: "Matriz" },
		person: { id: 100 },
		employee: { id: 10 },
		employeeType: { id: 1, value: "LAWYER", label: "Advogado" },
		user: { fullName: "Operador", email: "operator@example.com" },
		clerk: { userId: "user_a", organizationId: "org_a", sessionId: "sess_a" },
	};
}
const props = {
	direction: "receivable" as const,
	titleId: 5,
	balance: 60,
	cancelledAt: null,
	method: "PIX",
	contractId: 9,
	isAssignedToActor: true,
};
afterEach(cleanup);
describe("contextual title actions", () => {
	it("opens and closes settlement modal for an explicitly authorized member", () => {
		state.session = session([
			"org:receipts:create",
			"org:receipts:read_assigned",
		]);
		render(<TitleSettlementAction {...props} />);
		fireEvent.click(
			screen.getByRole("button", { name: "Registrar recebimento" }),
		);
		expect(screen.getByRole("dialog", { name: "Baixa" }).textContent).toContain(
			"receivable #5",
		);
		fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
		expect(screen.queryByRole("dialog")).toBeNull();
	});
	it.each([
		{ balance: 0 },
		{ cancelledAt: "2026-10-01" },
		{ isAssignedToActor: false },
		{ contractId: null },
	])("hides invalid settlement action %j", (change) => {
		state.session = session([
			"org:receipts:create",
			"org:receipts:read_assigned",
		]);
		render(<TitleSettlementAction {...props} {...change} />);
		expect(screen.queryByRole("button")).toBeNull();
	});
	it("requires an independent payment grant", () => {
		state.session = session(["org:payables:read_own", "org:payments:read_own"]);
		const { rerender } = render(
			<TitleSettlementAction {...props} direction="payable" />,
		);
		expect(screen.queryByRole("button")).toBeNull();
		state.session = session(["org:payments:create"]);
		rerender(<TitleSettlementAction {...props} direction="payable" />);
		expect(
			screen.getByRole("button", { name: "Registrar pagamento" }),
		).toBeTruthy();
	});
	it("opens reversal for the selected movement only with its grant", () => {
		state.session = session(["org:payments:read_own"]);
		const { rerender } = render(
			<SettlementReversalAction
				direction="payable"
				titleId={5}
				movementId={30}
			/>,
		);
		expect(screen.queryByRole("button")).toBeNull();
		state.session = session(["org:payments:reverse"]);
		rerender(
			<SettlementReversalAction
				direction="payable"
				titleId={5}
				movementId={30}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Estornar" }));
		expect(
			screen.getByRole("dialog", { name: "Estorno" }).textContent,
		).toContain("Movimentação #30");
	});
});
