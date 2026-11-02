// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const access = vi.hoisted(() => ({
	permissions: null as string[] | null,
	employeeId: 42,
}));

const fixtures = vi.hoisted(() => {
	const common = {
		id: 42,
		isActive: true,
		isSoftDeleted: false,
		createdAt: "2026-10-25T12:00:00Z",
		updatedAt: null,
	};
	return {
		person: {
			...common,
			fullName: "Maria",
			document: "52998224725",
			type: "Pessoa física",
			roles: ["customer"],
			contractCount: 2,
			email: "maria@example.com",
			phone: "11999999999",
		},
		fee: {
			...common,
			contractId: 7,
			contractProcessNumber: "PROC-7",
			clientId: 5,
			client: "Maria",
			revenueType: "Judicial",
			paymentDate: "2026-10-25",
			amount: 2000,
			installmentNumber: 2,
			generatesRemuneration: true,
			remunerationCount: 1,
		},
		remuneration: {
			...common,
			employeeId: 3,
			employeeName: "Ana",
			contractId: 7,
			contractProcessNumber: "PROC-7",
			clientId: 5,
			client: "Maria",
			paymentDate: "2026-10-25",
			amount: 700,
			effectivePercentage: 0.35,
			feeId: 42,
			revenueType: "Sucumbência",
			assignmentType: "Responsável",
			feeAmount: 2000,
			feeInstallmentNumber: 2,
			isManualOverride: false,
			parentFeeIsSoftDeleted: false,
		},
		expense: {
			...common,
			category: "Aluguel",
			expenseDate: "2026-10-25",
			amount: 1500,
			notes: "Despesa mensal",
		},
		auditLog: {
			id: 1,
			action: "UPDATE",
			entityName: "Maria",
			entityTypeLabel: "Cliente",
			entityId: "42",
			actorName: "Ana",
			actorEmail: "ana@example.com",
			occurredAtLabel: "25/10/2026",
			ipAddress: "127.0.0.1",
			userAgent: "Test browser",
			description: "Cliente atualizado",
			changeData: {
				before: { fullName: "Maria" },
				after: { fullName: "Maria Silva" },
			},
		},
	};
});
vi.mock("../people/hooks/use-data", () => ({
	usePerson: () => ({ person: fixtures.person }),
}));
vi.mock("../fees/hooks/use-data", () => ({
	useFee: () => ({ fee: fixtures.fee }),
}));
vi.mock("../remunerations/hooks/use-data", () => ({
	useRemuneration: () => ({ remuneration: fixtures.remuneration }),
}));
vi.mock("../expenses/hooks/use-data", () => ({
	useExpense: () => ({ expense: fixtures.expense }),
}));
vi.mock("../audit-logs/hooks/use-data", () => ({
	useAuditLog: () => ({ auditLog: fixtures.auditLog }),
}));
vi.mock("@/features/attachments", () => ({
	AttachmentSection: () => <p>Anexos completos</p>,
}));
vi.mock("@/features/contracts", () => ({ contractSearchDefaults: {} }));
vi.mock("@/features/remunerations", () => ({ remunerationSearchDefaults: {} }));
vi.mock("@/features/related-records", () => ({
	RelatedRecordLink: ({ children }: { children: ReactNode }) => (
		<button type="button">{children}</button>
	),
}));
vi.mock("@/shared/components/navigation-link", () => ({
	NavigationLink: ({
		children,
		to,
		search,
		"aria-label": label,
	}: {
		children: ReactNode;
		to: string;
		search?: Record<string, unknown>;
		"aria-label"?: string;
	}) => (
		<a
			href={`${to}?${new URLSearchParams(
				Object.entries(search ?? {})
					.filter(([, value]) => value !== undefined)
					.map(([key, value]) => [key, String(value)]),
			)}`}
			aria-label={label}
		>
			{children}
		</a>
	),
}));
vi.mock("@/shared/session", () => ({
	useLoggedUserSession: () => ({ employee: { id: access.employeeId } }),
	hasPermission: (_: unknown, key: string) =>
		access.permissions === null || access.permissions.includes(key),
}));

import { AuditLogOverview } from "../audit-logs/components/details/overview";
import { ExpenseOverview } from "../expenses/components/details/overview";
import { FeeOverview } from "../fees/components/details/overview";
import { PersonOverview } from "../people/components/details/overview";
import { RemunerationOverview } from "../remunerations/components/details/overview";

afterEach(cleanup);
beforeEach(() => {
	access.permissions = null;
	access.employeeId = 42;
});
describe("record page information hierarchy", () => {
	it("shares the calculation summary while omitting removed automatic explanation", () => {
		render(<RemunerationOverview id={42} section="finance" />);
		expect(
			screen.queryByText(/Valor gerado a partir do recebimento/),
		).toBeNull();
		expect(
			screen.getByText(/Remuneração gerada não confirma pagamento/),
		).toBeTruthy();
		expect(screen.getByText("Origem")).toBeTruthy();
	});
	it("exposes own receipt remuneration without implying the full team count", () => {
		access.permissions = ["org:remunerations:read_own"];
		const { rerender } = render(<FeeOverview id={42} section="finance" />);
		expect(screen.getByText("Ver minhas remunerações")).toBeTruthy();
		access.permissions = [];
		rerender(<FeeOverview id={42} section="finance" />);
		expect(screen.queryByRole("link")).toBeNull();
	});
	it("links receipt remunerations using the exact persisted receipt ID", () => {
		render(<FeeOverview id={42} section="finance" />);
		expect(
			screen
				.getByRole("link", { name: "Ver remunerações do recebimento #42" })
				.getAttribute("href"),
		).toBe("/remuneracoes?feeId=42");
	});
	it.each([PersonOverview, ExpenseOverview, FeeOverview, RemunerationOverview])(
		"keeps lifecycle state and registration out of page overview",
		(Overview) => {
			render(<Overview id={42} section="overview" />);
			expect(screen.queryByText("Situação")).toBeNull();
			expect(screen.queryByText("Criado em")).toBeNull();
			expect(screen.queryByText("Atualizado em")).toBeNull();
			expect(screen.queryByText("Anexos completos")).toBeNull();
		},
	);
	it("separates person contact while keeping the drawer complete", () => {
		const { rerender } = render(<PersonOverview id={42} section="overview" />);
		expect(screen.queryByText("maria@example.com")).toBeNull();
		rerender(<PersonOverview id={42} section="contact" />);
		expect(screen.getByText("maria@example.com")).toBeTruthy();
		expect(screen.queryByText("Documento")).toBeNull();
		rerender(<PersonOverview id={42} />);
		expect(screen.getByText("Documento")).toBeTruthy();
		expect(screen.getByText("maria@example.com")).toBeTruthy();
		expect(screen.getByText("Situação")).toBeTruthy();
	});
	it.each([
		{ Overview: FeeOverview, label: "Remuneração automática" },
		{ Overview: RemunerationOverview, label: "Percentual efetivo (%)" },
	])("puts $label in finance instead of overview", ({ Overview, label }) => {
		const { rerender } = render(<Overview id={42} section="overview" />);
		expect(screen.queryByText(label)).toBeNull();
		rerender(<Overview id={42} section="finance" />);
		expect(screen.getByText(label)).toBeTruthy();
		expect(screen.queryByText("Criado em")).toBeNull();
		rerender(<Overview id={42} />);
		expect(screen.getByText(label)).toBeTruthy();
	});
	it("separates audit event, change and technical data while preserving the drawer", () => {
		const { rerender } = render(<AuditLogOverview id={1} section="overview" />);
		expect(screen.getByText("Cliente atualizado")).toBeTruthy();
		expect(screen.queryByText("Maria Silva")).toBeNull();
		expect(screen.queryByText("Test browser")).toBeNull();
		rerender(<AuditLogOverview id={1} section="changes" />);
		expect(screen.getByText("Maria Silva")).toBeTruthy();
		expect(screen.queryByText("Cliente atualizado")).toBeNull();
		rerender(<AuditLogOverview id={1} section="technical" />);
		expect(screen.getByText("Test browser")).toBeTruthy();
		expect(screen.queryByText("Cliente atualizado")).toBeNull();
		rerender(<AuditLogOverview id={1} />);
		expect(screen.getByText("Cliente atualizado")).toBeTruthy();
		expect(screen.getByText("Test browser")).toBeTruthy();
	});
	it("does not repeat the installment in the receipt relationship label", () => {
		render(<RemunerationOverview id={42} section="finance" />);
		expect(
			screen.getByRole("button", { name: "Recebimento #42" }),
		).toBeTruthy();
		expect(screen.getByText("Nº da parcela")).toBeTruthy();
		expect(screen.queryByText(/parcela 2/)).toBeNull();
	});
});

it.each([PersonOverview, ExpenseOverview, FeeOverview, RemunerationOverview])(
	"hides attachments without read permission",
	(Overview) => {
		access.permissions = [];
		render(<Overview id={42} />);
		expect(screen.queryByText("Anexos completos")).toBeNull();
	},
);
it("shows remuneration origin context in finance and drawer", () => {
	const { rerender } = render(
		<RemunerationOverview id={42} section="finance" />,
	);
	expect(screen.getByText("Sucumbência")).toBeTruthy();
	expect(screen.getByText("Responsável")).toBeTruthy();
	rerender(<RemunerationOverview id={42} />);
	expect(screen.getByText("Sucumbência")).toBeTruthy();
	expect(screen.getByText("Responsável")).toBeTruthy();
});
