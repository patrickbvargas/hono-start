// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	permissions: ["org:contracts:read_all", "org:fees:read_all"],
	useAlerts: vi.fn(),
	retry: vi.fn(),
}));
vi.mock("@/shared/session", () => ({
	useLoggedUserSession: () => ({}),
	hasPermission: (_: unknown, key: string) => mocks.permissions.includes(key),
}));
vi.mock("../hooks/use-related-contract-alerts", () => ({
	useRelatedContractAlerts: mocks.useAlerts,
}));
vi.mock("@/features/related-records", () => ({
	RelatedRecordLink: ({
		children,
		id,
		kind,
	}: {
		children: ReactNode;
		id: number;
		kind: string;
	}) => (
		<button type="button" data-record-id={id} data-record-kind={kind}>
			{children}
		</button>
	),
}));
vi.mock("@/shared/components/navigation-link", () => ({
	NavigationLink: ({
		children,
		search,
		"aria-label": label,
	}: {
		children: ReactNode;
		search: { clientId: string; employeeId: string };
		"aria-label": string;
	}) => (
		<a
			aria-label={label}
			href={`/pendencias?clientId=${search.clientId}&employeeId=${search.employeeId}`}
		>
			{children}
		</a>
	),
}));

import { RelatedContractAlerts } from "../components/related-contract-alerts";

beforeEach(() => {
	mocks.permissions = ["org:contracts:read_all", "org:fees:read_all"];
	mocks.useAlerts.mockReset();
	mocks.retry.mockReset();
	mocks.useAlerts.mockReturnValue({
		pendingWork: {
			data: [
				{
					id: "revenue-9",
					contractId: 7,
					processNumber: "PROC-7",
					title: "Judicial: vencimento em atraso",
					severity: "high",
					dueDate: "2026-10-20",
					overdueDays: 5,
					remainingAmount: 2500,
				},
			],
			total: 8,
			contracts: 3,
		},
		isPending: false,
		error: null,
		retry: mocks.retry,
		collectionSearch: { clientId: "42", employeeId: "", page: 1, limit: 25 },
	});
});
afterEach(cleanup);
describe("related contract alert previews", () => {
	it("uses complete authorized totals, distinguishes the preview and retains contextual contract inspection", () => {
		render(<RelatedContractAlerts kind="client" id={42} />);
		expect(mocks.useAlerts).toHaveBeenCalledWith({ kind: "client", id: 42 });
		expect(screen.queryByText("8 alertas em 3 contratos.")).toBeNull();
		expect(screen.getByText("Alertas")).toBeTruthy();
		const title = screen.getByRole("heading", {
			name: "Judicial: vencimento em atraso",
		});
		expect(title.nextElementSibling?.textContent).toBe("Alta");
		expect(screen.getByText(/Exibindo 1 de 8 alertas/)).toBeTruthy();
		const contract = screen.getByRole("button", { name: "PROC-7" });
		expect(contract.getAttribute("data-record-id")).toBe("7");
		expect(contract.getAttribute("data-record-kind")).toBe("contract");
		expect(
			screen
				.getByRole("link", {
					name: "Ver todos os alertas dos contratos deste cliente",
				})
				.getAttribute("href"),
		).toBe("/pendencias?clientId=42&employeeId=");
	});
	it.each([
		{ permissions: [] },
		{ permissions: ["org:contracts:read_all"] },
		{ permissions: ["org:fees:read_all"] },
	])(
		"does not mount queries without both subject grants: %j",
		({ permissions }) => {
			mocks.permissions = permissions;
			const { container } = render(
				<RelatedContractAlerts kind="employee" id={42} />,
			);
			expect(mocks.useAlerts).not.toHaveBeenCalled();
			expect(container.textContent).toBe("");
		},
	);
	it("supports assigned contract and fee readers without promoting their scope", () => {
		mocks.permissions = [
			"org:contracts:read_assigned",
			"org:fees:read_assigned",
		];
		render(<RelatedContractAlerts kind="employee" id={9} />);
		expect(mocks.useAlerts).toHaveBeenCalledWith({ kind: "employee", id: 9 });
	});
	it("keeps loading, safe errors and retry local to the preview", () => {
		const result = mocks.useAlerts();
		mocks.useAlerts.mockReturnValue({
			...result,
			pendingWork: undefined,
			isPending: true,
		});
		const { rerender } = render(
			<RelatedContractAlerts kind="client" id={42} />,
		);
		expect(
			screen.getByLabelText("Carregando alertas dos contratos"),
		).toBeTruthy();
		mocks.useAlerts.mockReturnValue({
			...result,
			error: new Error("private SQL error"),
		});
		rerender(<RelatedContractAlerts kind="client" id={42} />);
		expect(screen.getByRole("alert").textContent).not.toContain("private SQL");
		const retryButton = screen.getByRole("button", {
			name: "Tentar novamente",
		});
		expect(retryButton.getAttribute("type")).toBe("button");
		expect(retryButton.className).toContain("h-7");
		fireEvent.click(retryButton);
		expect(mocks.retry).toHaveBeenCalledOnce();
	});
	it.each(["client", "employee"] as const)(
		"shows the empty %s alert section",
		(kind) => {
			mocks.useAlerts.mockReturnValue({
				...mocks.useAlerts(),
				pendingWork: { data: [], total: 0, contracts: 0 },
			});
			render(<RelatedContractAlerts kind={kind} id={42} />);
			expect(screen.getByText("Alertas")).toBeDefined();
			expect(
				screen.getByText("Nenhum alerta nos contratos vinculados."),
			).toBeDefined();
			expect(screen.queryByRole("list")).toBeNull();
		},
	);
});
