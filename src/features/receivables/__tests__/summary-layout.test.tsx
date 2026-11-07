// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/related-records", () => ({
	RelatedRecordLink: ({ children }: { children: ReactNode }) => (
		<span>{children}</span>
	),
}));
vi.mock("@/features/attachments", () => ({
	AttachmentSection: ({
		layout = "compact",
		canUpload,
	}: {
		layout?: string;
		canUpload: boolean;
	}) => (
		<section
			aria-label="Anexos"
			data-layout={layout}
			data-upload={String(canUpload)}
		>
			Anexos
		</section>
	),
}));
vi.mock("@/features/audit-logs", () => ({
	EntityAuditHistory: () => <p>Eventos registrados</p>,
}));
vi.mock("@/shared/components/value-visibility", () => ({
	SensitiveValue: ({ children }: { children: ReactNode }) => (
		<span>{children}</span>
	),
}));
vi.mock("../components/details/receipts", () => ({
	ReceivableReceipts: () => <p>Baixas registradas</p>,
}));
vi.mock("../hooks/use-workspace", () => ({
	useReceivableWorkspace: () => ({
		receivable: {
			id: 2,
			debtorName: "Devedor",
			debtorPersonId: 1,
			contractId: null,
			revenueId: null,
			kind: "INSTALLMENT",
			dueDate: "2026-11-07",
			amount: 100,
			principalAbated: 40,
			balance: 60,
			cashReceived: 35,
			situation: "partial",
			isPartial: true,
			analytic: "Honorários",
			expectedMethod: "Pix",
			notes: "Observação do título",
			cancelledAt: null,
			createdAt: "2026-11-07",
			updatedAt: "2026-11-07",
		},
		canReadDebtor: false,
		canReadContract: false,
		canReadReceipts: true,
		canReadAttachments: true,
		canReadAudit: true,
	}),
}));

import { ReceivableOverview } from "../components/details/overview";

afterEach(cleanup);
describe("receivable summary layout", () => {
	it("uses plain sections and compact attachments like other entity summaries", () => {
		const { container } = render(<ReceivableOverview id={2} />);
		expect(container.querySelector('[data-slot="form-section"]')).toBeNull();
		expect(screen.queryByRole("heading", { name: "Visão geral" })).toBeNull();
		expect(
			screen.getAllByRole("heading").map((heading) => heading.textContent),
		).toEqual(["Observações", "Recebimentos", "Registro", "Histórico"]);
		expect(
			screen
				.getByRole("region", { name: "Anexos" })
				.getAttribute("data-layout"),
		).toBe("compact");
		expect(
			screen
				.getByRole("region", { name: "Anexos" })
				.getAttribute("data-upload"),
		).toBe("false");
		expect(container.querySelectorAll('[data-slot="separator"]')).toHaveLength(
			5,
		);
		expect(screen.getByText("Observação do título")).toBeTruthy();
	});
	it("keeps the dedicated overview in its existing card without mounting summary sections", () => {
		const { container } = render(
			<ReceivableOverview id={2} section="overview" />,
		);
		expect(
			container.querySelectorAll('[data-slot="form-section"]'),
		).toHaveLength(1);
		expect(
			screen.getByRole("heading", { name: "Dados do título" }),
		).toBeTruthy();
		expect(screen.queryByText("Baixas registradas")).toBeNull();
		expect(screen.queryByText("Eventos registrados")).toBeNull();
		expect(screen.getByText("Observação do título")).toBeTruthy();
	});
});
