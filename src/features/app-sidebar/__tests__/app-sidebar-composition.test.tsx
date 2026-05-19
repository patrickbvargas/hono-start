// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/components/ui", () => ({
	Sidebar: ({
		children,
		collapsible,
		variant,
	}: {
		children: ReactNode;
		collapsible?: string;
		variant?: string;
	}) => (
		<div
			data-testid="sidebar"
			data-collapsible={collapsible}
			data-variant={variant}
		>
			{children}
		</div>
	),
	SidebarContent: ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	),
	SidebarFooter: ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	),
	SidebarHeader: ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	),
}));

vi.mock("../components/nav-header", () => ({
	NavHeader: () => <div>header</div>,
}));

vi.mock("../components/nav-main", () => ({
	NavMain: () => <div>main-nav</div>,
}));

vi.mock("../components/nav-user", () => ({
	NavUser: () => <div>user-nav</div>,
}));

import { AppSidebar } from "../components";

describe("AppSidebar composition", () => {
	afterEach(() => {
		cleanup();
	});

	it("uses shared sidebar icon collapse mode", () => {
		render(<AppSidebar />);

		expect(screen.getByTestId("sidebar").dataset.collapsible).toBe("icon");
		expect(screen.getByTestId("sidebar").dataset.variant).toBe("inset");
		expect(screen.getByText("header")).not.toBeNull();
		expect(screen.getByText("main-nav")).not.toBeNull();
		expect(screen.getByText("user-nav")).not.toBeNull();
	});
});
