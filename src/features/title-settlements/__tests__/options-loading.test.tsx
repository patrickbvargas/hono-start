// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ options: vi.fn() }));
vi.mock("../api/queries", () => ({
	getSettlementOptionsQueryOptions: (target: unknown) => ({
		queryKey: ["title-settlement", target],
		queryFn: mocks.options,
	}),
}));
vi.mock("../api/mutations", () => ({
	createSettlementMutationOptions: () => ({ mutationFn: vi.fn() }),
	reverseSettlementMutationOptions: () => ({ mutationFn: vi.fn() }),
}));
vi.mock("../utils/refresh", () => ({ refreshSettlementQueries: vi.fn() }));
vi.mock("@/shared/components/entity-form", () => ({
	EntityForm: ({
		title,
		children,
		footer,
		isLoading,
	}: {
		title: string;
		children: ReactNode;
		footer?: ReactNode;
		isLoading?: boolean;
	}) => (
		<section aria-label={title} aria-busy={isLoading}>
			{children}
			{footer}
		</section>
	),
}));

import { SettlementForm } from "../components/form";

beforeEach(() => {
	vi.resetAllMocks();
	mocks.options.mockResolvedValue({
		methods: [{ value: "PIX", label: "Pix" }],
	});
});
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});
function renderForm(direction: "receivable" | "payable") {
	return render(
		<QueryClientProvider
			client={
				new QueryClient({ defaultOptions: { queries: { retry: false } } })
			}
		>
			<SettlementForm
				target={{ direction, titleId: 5 }}
				balance={60}
				method="PIX"
				isContract={false}
				state={{ isOpen: true, onOpenChange: vi.fn(), close: vi.fn() }}
			/>
		</QueryClientProvider>,
	);
}
describe("settlement modal option loading", () => {
	it.each(["receivable", "payable"] as const)(
		"replaces the %s skeleton with a selectable payment method",
		async (direction) => {
			renderForm(direction);
			expect(
				await screen.findByRole("button", { name: "Confirmar baixa" }),
			).toBeTruthy();
			expect(
				screen
					.getByRole("combobox", { name: /Meio de pagamento real/ })
					.getAttribute("value"),
			).toBe("Pix");
			expect(
				screen
					.getByRole("region", {
						name:
							direction === "receivable"
								? "Registrar recebimento"
								: "Registrar pagamento",
					})
					.getAttribute("aria-busy"),
			).not.toBe("true");
		},
	);
	it("retries the options query after a loading error instead of repeating the cached error", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		mocks.options.mockRejectedValueOnce(new Error("Falha temporária"));
		renderForm("receivable");
		fireEvent.click(
			await screen.findByRole("button", { name: "Tentar novamente" }),
		);
		expect(
			await screen.findByRole("button", { name: "Confirmar baixa" }),
		).toBeTruthy();
		expect(mocks.options).toHaveBeenCalledTimes(2);
		expect(screen.queryByRole("alert")).toBeNull();
	});
});
