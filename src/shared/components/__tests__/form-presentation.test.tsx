// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FormCheckboxSkeleton } from "../form-field-skeleton";
import { FormSection } from "../form-section";
import { Button } from "../ui";

afterEach(cleanup);

describe("shared form presentation", () => {
	it("keeps a section action beside the heading and fields in the shared spacing", () => {
		const { container } = render(
			<FormSection
				title="Equipe"
				action={
					<Button variant="ghost" size="sm">
						Adicionar colaborador
					</Button>
				}
			>
				<span>Campos</span>
			</FormSection>,
		);
		const action = screen.getByRole("button", {
			name: "Adicionar colaborador",
		});
		expect(action.parentElement?.parentElement?.className).toContain(
			"items-center",
		);
		expect(action.parentElement?.parentElement?.textContent).toContain(
			"Equipe",
		);
		expect(
			container.querySelector('[data-slot="field-group"]')?.className,
		).toContain("gap-4");
	});

	it("places the checkbox placeholder before its label, matching the loaded field", () => {
		const { container } = render(<FormCheckboxSkeleton />);
		expect(container.firstElementChild?.firstElementChild?.className).toContain(
			"size-4",
		);
	});
});
