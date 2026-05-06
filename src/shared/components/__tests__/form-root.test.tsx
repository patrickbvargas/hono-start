// @vitest-environment jsdom

import type { AnyFormApi } from "@tanstack/react-form-start";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FormRoot } from "../form/form";

function createFormApiMock() {
	return {
		formId: "auth-form",
		handleSubmit: vi.fn(),
	} as unknown as AnyFormApi;
}

describe("FormRoot", () => {
	it("uses post as the native submission default", () => {
		const form = createFormApiMock();

		const { container } = render(
			<FormRoot form={form}>
				<button type="submit">Enviar</button>
			</FormRoot>,
		);

		expect(container.querySelector("form")?.getAttribute("method")).toBe(
			"post",
		);
	});

	it("allows explicit method override", () => {
		const form = createFormApiMock();

		const { container } = render(
			<FormRoot form={form} method="get">
				<button type="submit">Buscar</button>
			</FormRoot>,
		);

		expect(container.querySelector("form")?.getAttribute("method")).toBe("get");
	});

	it("delegates submit handling to TanStack Form", () => {
		const form = createFormApiMock();

		const { container } = render(
			<FormRoot form={form}>
				<button type="submit">Entrar</button>
			</FormRoot>,
		);

		const element = container.querySelector("form");

		expect(element).not.toBeNull();

		if (!element) {
			throw new Error("Expected rendered form element.");
		}

		fireEvent.submit(element);

		expect(form.handleSubmit).toHaveBeenCalledOnce();
	});
});
