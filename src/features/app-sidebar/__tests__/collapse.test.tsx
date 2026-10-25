// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { UserIcon } from "lucide-react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { setOpenMobile } = vi.hoisted(() => ({ setOpenMobile: vi.fn() }));

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		to,
		onClick,
	}: {
		children: ReactNode;
		to: string;
		onClick?: () => void;
	}) => (
		<a
			href={to}
			onClick={(event) => {
				event.preventDefault();
				onClick?.();
			}}
		>
			{children}
		</a>
	),
	useLocation: () => ({ pathname: "/clientes" }),
}));

vi.mock("@/shared/components/ui", () => ({
	useSidebar: () => ({ setOpenMobile }),
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

vi.mock("@/shared/session", () => ({
	hasPermission: (
		_session: unknown,
		action: "org:employees:read" | "org:audit_logs:read" | string,
	) => action !== "org:employees:read",
	useLoggedUserSession: () => ({ permissions: [] }),
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
			resolve("src/features/app-sidebar/components/nav-header/index.tsx"),
			"utf8",
		);
		const navUserSource = readFileSync(
			resolve("src/features/app-sidebar/components/nav-user/index.tsx"),
			"utf8",
		);

		expect(navHeaderSource).toContain("group-data-[collapsible=icon]:hidden");
		expect(navUserSource).toContain("group-data-[collapsible=icon]:hidden");
	});

	it("hides admin-only items for non-admin sessions", () => {
		render(
			<NavMain
				items={[
					{
						title: "Geral",
						url: "#",
						items: [
							{
								title: "Dashboard",
								url: "/",
								icon: UserIcon,
							},
							{
								title: "Colaboradores",
								url: "/colaboradores",
								icon: UserIcon,
								permission: "org:employees:read",
							},
						],
					},
				]}
			/>,
		);

		expect(screen.getByText("Dashboard")).not.toBeNull();
		expect(screen.queryByText("Colaboradores")).toBeNull();
	});

	it("hides empty groups when all routes inside are forbidden", () => {
		render(
			<NavMain
				items={[
					{
						title: "Outro",
						url: "#",
						items: [
							{
								title: "Colaboradores",
								url: "/colaboradores",
								icon: UserIcon,
								permission: "org:employees:read",
							},
						],
					},
				]}
			/>,
		);

		expect(screen.queryByText("Outro")).toBeNull();
		expect(screen.queryByTestId("sidebar-group")).toBeNull();
	});
	it("closes the mobile menu when a destination is selected", () => {
		setOpenMobile.mockClear();
		render(
			<NavMain
				items={[
					{
						title: "Geral",
						url: "#",
						items: [{ title: "Clientes", url: "/clientes", icon: UserIcon }],
					},
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("link", { name: "Clientes" }));
		expect(setOpenMobile).toHaveBeenCalledExactlyOnceWith(false);
	});
});
