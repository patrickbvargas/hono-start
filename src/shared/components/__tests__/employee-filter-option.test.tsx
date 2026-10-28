// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAppForm } from "@/shared/hooks/use-app-form";
import {
	renderEmployeeFilterAvatar,
	renderEmployeeFilterOption,
} from "../employee-filter-option";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function Example() {
	const form = useAppForm({ defaultValues: { employeeId: "1" } });
	return (
		<form.Form form={form}>
			<form.AppField name="employeeId">
				{(field) => (
					<field.Autocomplete
						label="Colaborador"
						options={[{ value: "1", label: "Ana Silva" }]}
						renderOption={renderEmployeeFilterOption}
						renderSelectedAdornment={renderEmployeeFilterAvatar}
					/>
				)}
			</form.AppField>
		</form.Form>
	);
}

describe("employee filter avatar", () => {
	it("renders the linked photo without repeating the accessible name", async () => {
		vi.stubGlobal(
			"Image",
			class {
				complete = true;
				naturalWidth = 48;
			},
		);
		const { container } = render(
			renderEmployeeFilterOption({
				value: "1",
				label: "Ana Silva",
				imageUrl: "https://img.clerk.com/photo.png",
			}),
		);
		await waitFor(() =>
			expect(container.querySelector("img")?.getAttribute("src")).toBe(
				"https://img.clerk.com/photo.png",
			),
		);
		expect(container.querySelector("img")?.getAttribute("alt")).toBe("");
		expect(screen.getByText("Ana Silva")).toBeTruthy();
	});

	it("keeps business name visible with initials for unlinked collaborators", async () => {
		render(renderEmployeeFilterOption({ value: "1", label: "  Ana   Silva " }));
		expect(screen.getByText("Ana Silva")).toBeTruthy();
		expect(await screen.findByText("AS")).toBeTruthy();
	});

	it("shows initials when the linked photo cannot load", async () => {
		let fail: (() => void) | undefined;
		vi.stubGlobal(
			"Image",
			class {
				onload = null;
				onerror: (() => void) | null = null;
				set src(_value: string) {
					fail = () => this.onerror?.();
				}
			},
		);
		render(
			renderEmployeeFilterOption({
				value: "1",
				label: "Ana Silva",
				imageUrl: "https://img.clerk.com/missing.png",
			}),
		);
		await waitFor(() => expect(fail).toBeDefined());
		act(() => fail?.());
		expect(await screen.findByText("AS")).toBeTruthy();
	});

	it("keeps selected avatar aligned with form selection and clears it", async () => {
		const { container } = render(<Example />);
		expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe(
			"Ana Silva",
		);
		expect(
			container.querySelector(
				'[data-align="inline-start"] [data-slot="avatar"]',
			),
		).toBeTruthy();
		const clear = container.querySelector('[data-slot="combobox-clear"]');
		expect(clear).toBeTruthy();
		fireEvent.click(clear as HTMLElement);
		await waitFor(() =>
			expect(
				container.querySelector(
					'[data-align="inline-start"] [data-slot="avatar"]',
				),
			).toBeNull(),
		);
		expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("");
	});
});
