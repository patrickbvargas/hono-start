// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		to,
	}: {
		children: ReactNode;
		to: string;
	}) => <a href={to}>{children}</a>,
}));

vi.mock("@/shared/components/ui", () => ({
	SidebarMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	SidebarMenuButton: ({
		children,
		render,
	}: {
		children?: ReactNode;
		render?: ReactNode;
	}) => <button type="button">{render ?? children}</button>,
	SidebarMenuItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

import { ROUTES } from "@/shared/config/routes";
import { NavHeader } from "../components/nav-header";

describe("NavHeader", () => {
	afterEach(() => {
		cleanup();
	});

	it("links brand button to dashboard route", () => {
		render(<NavHeader />);

		const link = screen.getByText("Hono").closest("a");

		expect(link).not.toBeNull();
		expect(link?.getAttribute("href")).toBe(ROUTES.dashboard.url);
	});
});
