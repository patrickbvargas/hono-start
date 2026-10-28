// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ListEmptyState } from "@/shared/components/ui/list-empty-state";
import { useClientFilter } from "../hooks/use-filter";

const route = vi.hoisted(() => ({
	search: {
		query: "Maria",
		type: [],
		active: "all",
		status: "active",
		page: 4,
		limit: 50,
		column: "fullName",
		direction: "desc",
	},
	navigate: vi.fn(),
}));
vi.mock("@tanstack/react-router", () => ({
	useSearch: () => route.search,
	useNavigate: () => route.navigate,
}));

function Harness() {
	const controller = useClientFilter();
	return (
		<>
			<controller.form.AppField name="query">
				{(field) => (
					<input
						aria-label="Busca"
						value={field.state.value}
						onChange={(event) => field.handleChange(event.target.value)}
					/>
				)}
			</controller.form.AppField>
			<ListEmptyState
				title="Nenhum cliente disponível"
				description="Clientes aparecerão aqui."
				hasFilters={controller.canClearFilters}
				onClearFilters={controller.handleClearFilters}
			/>
		</>
	);
}

afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.clearAllMocks();
});

it("clears fields and URL defaults without a pending search restoring old values", async () => {
	vi.useFakeTimers();
	render(<Harness />);
	fireEvent.change(screen.getByRole("textbox", { name: "Busca" }), {
		target: { value: "Busca pendente" },
	});
	expect(route.navigate).not.toHaveBeenCalled();
	fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
	expect(
		(screen.getByRole("textbox", { name: "Busca" }) as HTMLInputElement).value,
	).toBe("");
	await act(async () => {
		await vi.advanceTimersByTimeAsync(500);
	});
	expect(route.navigate).toHaveBeenCalledOnce();
	const updater = route.navigate.mock.calls[0][0].search;
	expect(updater(route.search)).toEqual({
		...route.search,
		query: "",
		page: 1,
	});
});
