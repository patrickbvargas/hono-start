// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ListFilters } from "../list-filters";

describe("ListFilters", () => {
	it("hides empty direct children to avoid layout gaps", () => {
		const { container } = render(<ListFilters />);

		expect(container.firstElementChild?.className).toContain("[&>*:empty]:hidden");
	});
});
