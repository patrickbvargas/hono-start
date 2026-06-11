// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FormSubmitButton } from "../form/submit-button";

const { useFormContextMock } = vi.hoisted(() => ({
	useFormContextMock: vi.fn(),
}));

vi.mock("@/shared/hooks/use-app-form", () => ({
	useFormContext: useFormContextMock,
}));

function createFormContextMock(isSubmitting: boolean) {
	return {
		handleSubmit: vi.fn(),
		Subscribe: ({
			children,
		}: {
			children: (value: boolean) => React.ReactNode;
		}) => children(isSubmitting),
	};
}

describe("FormSubmitButton", () => {
	it("keeps original label while showing spinner during form submission", () => {
		useFormContextMock.mockReturnValue(createFormContextMock(true));

		render(<FormSubmitButton>Entrar</FormSubmitButton>);

		const button = screen.getByRole("button", { name: "Entrar" });

		expect(button.hasAttribute("disabled")).toBe(true);
		expect(button.textContent).toContain("Entrar");
		expect(button.querySelector("svg")).not.toBeNull();
	});

	it("supports external loading state in addition to TanStack form submission", () => {
		useFormContextMock.mockReturnValue(createFormContextMock(false));

		render(<FormSubmitButton isLoading>Salvar nova senha</FormSubmitButton>);

		const button = screen.getByRole("button", { name: "Salvar nova senha" });

		expect(button.hasAttribute("disabled")).toBe(true);
		expect(button.textContent).toContain("Salvar nova senha");
		expect(button.querySelector("svg")).not.toBeNull();
	});
});
