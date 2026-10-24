// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PaginationView } from "../pagination";

afterEach(cleanup);
describe("PaginationView", () => {
	it("keeps page-size selection and navigation available with a single page", () => {
		render(
			<PaginationView
				totalRecords={19}
				page={1}
				limit={25}
				handlePageSizeChange={vi.fn()}
				renderPage={(page, kind) => (
					<button type="button">
						{kind}:{page}
					</button>
				)}
			/>,
		);
		expect(screen.getByText("Por página")).toBeTruthy();
		expect(screen.getByRole("combobox")).toBeTruthy();
		expect(screen.getByRole("button", { name: "number:1" })).toBeTruthy();
	});
});
