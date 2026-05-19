// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { UserIcon } from "lucide-react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, to }: { children: ReactNode; to: string }) => (
		<a href={to}>{children}</a>
	),
	useLocation: () => ({ pathname: "/clientes" }),
}));

vi.mock("@/shared/components/ui", () => ({
	SidebarGroup: ({
		children,
		className,
	}: {
		children: ReactNode;
		className?: string;
	}) => (
		<div data-testid="sidebar-group" className={className}>
			{children}
		</div>
	),
	SidebarGroupLabel: ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	),
	SidebarMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	SidebarMenuButton: ({
		children,
		className,
		isActive,
		render,
		tooltip,
	}: {
		children?: ReactNode;
		className?: string;
		isActive?: boolean;
		render?: ReactNode;
		tooltip?: string;
	}) => (
		<div
			data-testid="sidebar-menu-button"
			data-active={String(Boolean(isActive))}
			data-tooltip={tooltip ?? ""}
			className={className}
		>
			{render ?? children}
		</div>
	),
	SidebarMenuItem: ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	),
}));

import { NavMain } from "../components/nav-main";

describe("app sidebar collapse behavior", () => {
	afterEach(() => {
		cleanup();
	});

	it("keeps main navigation groups rendered and hides only labels in compact mode", () => {
		render(
			<NavMain
				items={[
					{
						title: "Geral",
						url: "#",
						items: [
							{
								title: "Clientes",
								url: "/clientes",
								icon: UserIcon,
							},
						],
					},
				]}
			/>,
		);

		expect(screen.getByTestId("sidebar-group").className).not.toContain(
			"group-data-[collapsible=icon]:hidden",
		);
		expect(screen.getByText("Clientes").className).toContain(
			"group-data-[collapsible=icon]:hidden",
		);
		expect(document.querySelector("svg")).not.toBeNull();
		expect(screen.getByTestId("sidebar-menu-button").dataset.tooltip).toBe(
			"Clientes",
		);
		expect(screen.getByTestId("sidebar-menu-button").dataset.active).toBe(
			"true",
		);
	});

	it("adds compact hide classes to header and user text blocks", () => {
		const navHeaderSource = readFileSync(
			resolve("src/features/app-sidebar/components/nav-header.tsx"),
			"utf8",
		);
		const navUserSource = readFileSync(
			resolve("src/features/app-sidebar/components/nav-user.tsx"),
			"utf8",
		);

		expect(navHeaderSource).toContain("group-data-[collapsible=icon]:hidden");
		expect(navUserSource).toContain("group-data-[collapsible=icon]:hidden");
	});
});
