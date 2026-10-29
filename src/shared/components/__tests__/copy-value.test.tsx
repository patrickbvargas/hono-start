// @vitest-environment jsdom

import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CopyValue } from "../ui/copy-value";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

it("keeps copy and record navigation as independent actions", async () => {
	const writeText = vi.fn().mockResolvedValue(undefined);
	const navigate = vi.fn();
	vi.stubGlobal("navigator", { clipboard: { writeText } });
	render(
		<CopyValue value="0001234-56" label="número do processo">
			<a
				href="/contratos/1"
				onClick={(event) => {
					event.preventDefault();
					navigate();
				}}
			>
				0001234-56
			</a>
		</CopyValue>,
	);
	const copy = screen.getByRole("button", {
		name: "Copiar número do processo",
	});
	const link = screen.getByRole("link");
	expect(link.contains(copy)).toBe(false);
	fireEvent.click(copy);
	await waitFor(() =>
		expect(screen.getByRole("status").textContent).toBe("Copiado"),
	);
	expect(writeText).toHaveBeenCalledWith("0001234-56");
	expect(navigate).not.toHaveBeenCalled();
	fireEvent.click(link);
	expect(navigate).toHaveBeenCalledTimes(1);
	expect(writeText).toHaveBeenCalledTimes(1);
});

it("does not offer copy for missing values", () => {
	render(
		<CopyValue value={null} label="processo">
			—
		</CopyValue>,
	);
	expect(screen.queryByRole("button")).toBeNull();
});
