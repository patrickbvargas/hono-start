// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EntityListAccordion } from "../entity-list-accordion";

describe("EntityListAccordion", () => {
	it("renders optional header actions and expanded content", () => {
		const onAction = vi.fn();

		render(
			<EntityListAccordion
				items={[{ id: 1, title: "Arquivo.pdf", detail: "Detalhe" }]}
				getKey={(item) => String(item.id)}
				getTitle={(item) => item.title}
				getSummary={(item) => item.title}
				actions={(item) => (
					<button type="button" onClick={() => onAction(item.id)}>
						Excluir
					</button>
				)}
				renderContent={(item) => <div>{item.detail}</div>}
			/>,
		);

		expect(screen.getByRole("button", { name: "Excluir" })).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: "Arquivo.pdf" }));

		expect(screen.getByText("Detalhe")).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

		expect(onAction).toHaveBeenCalledWith(1);
	});
});
