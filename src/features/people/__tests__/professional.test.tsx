// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ employee: true, visible: true }));
vi.mock("../hooks/use-data", () => ({
	usePerson: () => ({
		person: {
			isEmployee: state.employee,
			professional: state.visible
				? {
						typeLabel: "Advogado",
						oabNumber: "RS123456",
						remunerationPercent: 0.1,
						referrerPercent: 0.02,
					}
				: undefined,
		},
	}),
}));

import { PersonProfessional } from "../components/details/overview";
import { personWorkspaceSearchSchema } from "../schemas/workspace";

afterEach(() => {
	cleanup();
	state.employee = true;
	state.visible = true;
});
describe("professional overview block", () => {
	it("renders the collaborator information as a section", () => {
		render(<PersonProfessional id={1} />);
		expect(screen.getByText("Dados profissionais")).toBeTruthy();
		expect(screen.getByText("10%")).toBeTruthy();
		expect(screen.queryByRole("tab")).toBeNull();
	});
	it("never renders for non-collaborators or hidden projections", () => {
		state.employee = false;
		const view = render(<PersonProfessional id={1} />);
		expect(view.container.textContent).toBe("");
		state.employee = true;
		state.visible = false;
		view.rerender(<PersonProfessional id={1} />);
		expect(view.container.textContent).toBe("");
	});
	it("maps the removed professional tab back to overview", () => {
		expect(personWorkspaceSearchSchema.parse({ tab: "professional" }).tab).toBe(
			"overview",
		);
	});
});
