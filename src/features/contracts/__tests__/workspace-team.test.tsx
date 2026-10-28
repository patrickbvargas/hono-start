// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { ContractTeam } from "../components/workspace/team";
import type { ContractDetail } from "../schemas/model";

vi.mock("@/features/related-records", () => ({
	RelatedRecordLink: ({
		children,
		id,
	}: {
		children: ReactNode;
		id: number;
	}) => <a href={`/colaboradores/${id}`}>{children}</a>,
}));
afterEach(cleanup);

const inactive: ContractDetail["assignments"][number] = {
	id: 459,
	employeeId: 10,
	employeeName: "Colaborador inativo",
	employeeType: "Advogado",
	employeeTypeValue: "LAWYER",
	assignmentType: "Responsável",
	assignmentTypeValue: "RESPONSIBLE",
	isActive: false,
	isSoftDeleted: false,
};

it("shows non-deleted assignments without activation badges", () => {
	const edit = vi.fn();
	render(
		<ContractTeam
			assignments={[
				inactive,
				{
					...inactive,
					id: 460,
					employeeName: "Colaborador ativo",
					isActive: true,
				},
			]}
			canReadEmployees
			onEdit={edit}
		/>,
	);
	expect(screen.queryByText("Nenhum colaborador vinculado.")).toBeNull();
	expect(
		screen.getByRole("link", { name: "Colaborador inativo" }),
	).toBeTruthy();
	expect(screen.getByText("Colaborador ativo")).toBeTruthy();
	expect(screen.queryByText("Inativo")).toBeNull();
	fireEvent.click(screen.getByRole("button", { name: "Editar equipe" }));
	expect(edit).toHaveBeenCalledOnce();
});

it("omits deleted assignments and retains the real empty state without an empty border", () => {
	const { container } = render(
		<ContractTeam
			assignments={[{ ...inactive, isSoftDeleted: true }]}
			canReadEmployees={false}
		/>,
	);
	expect(screen.getByText("Nenhum colaborador vinculado.")).toBeTruthy();
	expect(screen.queryByText(inactive.employeeName)).toBeNull();
	expect(container.querySelector(".divide-y")).toBeNull();
	expect(screen.queryByRole("button", { name: "Editar equipe" })).toBeNull();
});

it("does not expose employee links without employee read access", () => {
	render(<ContractTeam assignments={[inactive]} canReadEmployees={false} />);
	expect(screen.getByText(inactive.employeeName)).toBeTruthy();
	expect(screen.queryByRole("link")).toBeNull();
});
