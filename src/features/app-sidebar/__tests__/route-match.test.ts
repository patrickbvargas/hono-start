import { describe, expect, it } from "vitest";
import { isSidebarRouteActive } from "../components/nav-main";

describe("isSidebarRouteActive", () => {
	it("matches dashboard only on root path", () => {
		expect(isSidebarRouteActive("/", "/")).toBe(true);
		expect(isSidebarRouteActive("/clientes", "/")).toBe(false);
	});

	it("matches exact non-root routes", () => {
		expect(isSidebarRouteActive("/clientes", "/clientes")).toBe(true);
	});

	it("matches nested paths under route segment", () => {
		expect(isSidebarRouteActive("/clientes/123", "/clientes")).toBe(true);
	});

	it("does not match routes that only share prefix text", () => {
		expect(isSidebarRouteActive("/clientes-ativos", "/clientes")).toBe(false);
	});
});
