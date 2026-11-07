// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ClerkPermission, LoggedUserSession } from "@/shared/session";
import type {
	ExpenseDetail,
	ExpenseFinancial as ExpenseFinancialModel,
} from "../schemas/model";

const mocks = vi.hoisted(() => ({
	session: null as LoggedUserSession | null,
	financial: vi.fn(),
}));
vi.mock("@/shared/session", async (importOriginal) => ({
	...(await importOriginal<typeof import("@/shared/session")>()),
	useLoggedUserSession: () => mocks.session,
}));
vi.mock("../hooks/use-data", () => ({ useExpenseFinancial: mocks.financial }));
vi.mock("@/features/financial-titles", async (importOriginal) => ({
	...(await importOriginal<typeof import("@/features/financial-titles")>()),
	ExpenseGenerationForm: ({
		expenseId,
		negotiatedAmount,
		onSuccess,
	}: {
		expenseId: number;
		negotiatedAmount: number;
		onSuccess: () => Promise<void>;
	}) => (
		<div role="dialog" aria-label="Gerar parcelas">
			<span>
				{expenseId}:{negotiatedAmount}
			</span>
			<button onClick={onSuccess}>Confirmar títulos</button>
		</div>
	),
}));

import { ExpenseFinancial } from "../components/details/financial";

const expense: ExpenseDetail = {
	id: 9,
	supplierId: 4,
	supplierName: "Fornecedor",
	supplierDocument: null,
	negotiatedAmount: 100,
	notes: null,
	isActive: true,
	isSoftDeleted: false,
	hasGeneratedTitles: false,
	createdAt: "2026-11-01T00:00:00.000Z",
	updatedAt: null,
};
const financial: ExpenseFinancialModel = {
	paidAmount: 90,
	remainingAmount: 0,
	installments: [
		{
			id: 1,
			kind: "DOWN_PAYMENT",
			dueDate: "2026-12-01",
			expectedAmount: 100,
			paidAmount: 90,
			principalAbated: 100,
			remainingAmount: 0,
			paymentDate: "2026-11-01",
			isCancelled: false,
		},
	],
};
const grants: ClerkPermission[] = [
	"org:expenses:read",
	"org:expenses:update",
	"org:payables:generate",
	"org:payables:read_all",
];

beforeEach(() => {
	mocks.session = {
		permissions: [...grants],
		clerk: { userId: "u", organizationId: "o", sessionId: "s" },
		user: { fullName: "Admin", email: "admin@example.com" },
		employee: { id: 10 },
		person: { id: 100 },
		firm: { id: 7, name: "Matriz" },
		employeeType: { id: 1, value: "LAWYER", label: "Advogado" },
	};
	mocks.financial.mockReset().mockReturnValue({
		financial: { paidAmount: 0, remainingAmount: 0, installments: [] },
	});
});
afterEach(cleanup);

function setup(overrides: Partial<ExpenseDetail> = {}) {
	const client = new QueryClient();
	const invalidate = vi.spyOn(client, "invalidateQueries");
	const view = render(
		<QueryClientProvider client={client}>
			<ExpenseFinancial expense={{ ...expense, ...overrides }} />
		</QueryClientProvider>,
	);
	return { ...view, invalidate };
}

describe("expense financial workspace", () => {
	it("explains the payable balance on label focus", async () => {
		setup();
		const label = screen.getByRole("button", { name: "Saldo a pagar" });
		fireEvent.keyDown(document, { key: "Tab" });
		act(() => label.focus());
		const tooltip = await screen.findByRole("tooltip");
		expect(tooltip.textContent).toBe(
			"Valor dos títulos menos principal já abatido. Sem títulos gerados, saldo zero.",
		);
	});
	it("opens source-specific generation and refreshes expense queries before closing", async () => {
		const { invalidate } = setup();
		expect(screen.getByText("Aguardando geração de títulos")).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Gerar parcelas" }));
		expect(screen.getByText("9:100")).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Confirmar títulos" }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["expense"] });
	});
	it("shows generated installments including entry and payment status without regeneration", () => {
		mocks.financial.mockReturnValue({ financial });
		setup({ hasGeneratedTitles: true });
		expect(screen.getByText("Quitado")).toBeTruthy();
		expect(screen.getByText("Títulos gerados")).toBeTruthy();
		expect(screen.queryByRole("button", { name: "Gerar parcelas" })).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: /Ver parcelas/ }));
		expect(
			screen.getByRole("table", { name: "Parcelas da despesa" }),
		).toBeTruthy();
		expect(screen.getByText("Entrada")).toBeTruthy();
		expect(screen.getByText("Paga")).toBeTruthy();
	});
	it("shows pending before generation rather than settled zero debt", () => {
		setup();
		expect(screen.getByText("Pendente")).toBeTruthy();
		expect(screen.queryByText("Quitado")).toBeNull();
	});
	it("shows overdue from an open title, ignoring cancelled titles", () => {
		mocks.financial.mockReturnValue({
			financial: {
				...financial,
				remainingAmount: 50,
				installments: [
					{
						...financial.installments[0],
						dueDate: "2020-01-01",
						remainingAmount: 50,
					},
				],
			},
		});
		setup({ hasGeneratedTitles: true });
		expect(screen.getByText("Em atraso")).toBeTruthy();
	});
	it.each([
		{ isActive: false },
		{ isSoftDeleted: true },
		{ hasGeneratedTitles: true },
	])(
		"blocks generation for unavailable or generated expense %j",
		(overrides) => {
			setup(overrides);
			expect(
				screen.queryByRole("button", { name: "Gerar parcelas" }),
			).toBeNull();
		},
	);
	it.each(["org:payables:generate", "org:expenses:update"] as const)(
		"requires %s to generate",
		(missing) => {
			if (!mocks.session) {
				throw new Error("Missing test session");
			}
			mocks.session.permissions = grants.filter((grant) => grant !== missing);
			setup();
			expect(
				screen.queryByRole("button", { name: "Gerar parcelas" }),
			).toBeNull();
		},
	);
	it("does not query or display financial totals without all-payables read authority", () => {
		if (!mocks.session) {
			throw new Error("Missing test session");
		}
		mocks.session.permissions = grants.filter(
			(grant) => grant !== "org:payables:read_all",
		);
		setup();
		expect(mocks.financial).not.toHaveBeenCalled();
		expect(screen.queryByText("Saldo a pagar")).toBeNull();
		expect(screen.queryByText("Pendente")).toBeNull();
		expect(screen.queryByText("Quitado")).toBeNull();
		expect(screen.getByRole("button", { name: "Gerar parcelas" })).toBeTruthy();
	});
});
