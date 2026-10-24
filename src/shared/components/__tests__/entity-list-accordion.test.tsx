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

it("opens incomplete rows but respects manual collapse and reopens on validation", () => {
	const props = {
		getKey: (item: { id: number; incomplete: boolean }) => String(item.id),
		getTitle: () => "Receita",
		getSummary: () => "Resumo",
		renderContent: () => <input aria-label="Valor" />,
		isItemAutoOpen: (item: { incomplete: boolean }) => item.incomplete,
	};
	const { rerender, unmount } = render(
		<EntityListAccordion {...props} items={[{ id: 10, incomplete: true }]} />,
	);
	const trigger = screen.getByRole("button", { name: "Resumo" });
	expect(trigger.getAttribute("aria-expanded")).toBe("true");
	fireEvent.click(trigger);
	expect(trigger.getAttribute("aria-expanded")).toBe("false");
	rerender(
		<EntityListAccordion
			{...props}
			autoOpenRevision={1}
			items={[{ id: 10, incomplete: true }]}
		/>,
	);
	expect(trigger.getAttribute("aria-expanded")).toBe("true");
	fireEvent.click(trigger);
	expect(trigger.getAttribute("aria-expanded")).toBe("false");
	rerender(
		<EntityListAccordion {...props} items={[{ id: 10, incomplete: true }]} />,
	);
	expect(trigger.getAttribute("aria-expanded")).toBe("true");
	unmount();
});
