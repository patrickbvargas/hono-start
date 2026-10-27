// @vitest-environment jsdom

import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import type { ImgHTMLAttributes, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const provider = vi.hoisted(() => ({
	isLoaded: true,
	organization: {
		name: "Escritório Silva",
		slug: "silva",
		imageUrl: "https://example.com/silva.png",
		reload: vi.fn().mockResolvedValue(undefined),
	} as {
		name: string;
		slug: string | null;
		imageUrl: string;
		reload: ReturnType<typeof vi.fn>;
	} | null,
	branding: { name: "Hono Legal", imageUrl: "https://example.com/app.png" } as
		| { name: string; imageUrl: string }
		| undefined,
	setOpenMobile: vi.fn(),
}));

vi.mock("@clerk/tanstack-react-start", () => ({
	useOrganization: () => provider,
	useClerk: () => ({ frontendApi: "example.clerk.accounts.dev" }),
}));
vi.mock("@tanstack/react-query", async (importOriginal) => ({
	...(await importOriginal<typeof import("@tanstack/react-query")>()),
	useQuery: () => ({ data: provider.branding }),
}));
vi.mock("@/features/authentication", () => ({
	OrganizationSwitcher: ({
		organizationName,
	}: {
		organizationName: string;
	}) => <button type="button">{organizationName}</button>,
}));
vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		to,
		onClick,
	}: {
		children: ReactNode;
		to: string;
		onClick: () => void;
	}) => (
		<a href={to} onClick={onClick}>
			{children}
		</a>
	),
}));
vi.mock("@/shared/components/ui", () => ({
	useSidebar: () => ({ setOpenMobile: provider.setOpenMobile }),
	Avatar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	AvatarImage: (props: ImgHTMLAttributes<HTMLImageElement>) => (
		<img {...props} />
	),
	AvatarFallback: ({ children }: { children: ReactNode }) => (
		<span>{children}</span>
	),
	SidebarMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	SidebarMenuButton: ({ render }: { render: ReactNode }) => <div>{render}</div>,
	SidebarMenuItem: ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	),
}));

import { ROUTES } from "@/shared/config/routes";
import { NavHeader } from "../components/nav-header";

describe("NavHeader", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		provider.branding = {
			name: "Hono Legal",
			imageUrl: "https://example.com/app.png",
		};
		provider.isLoaded = true;
		provider.organization = {
			name: "Escritório Silva",
			slug: "silva",
			imageUrl: "https://example.com/silva.png",
			reload: vi.fn().mockResolvedValue(undefined),
		};
	});
	afterEach(cleanup);

	it("uses Clerk identity and preserves dashboard navigation", () => {
		render(<NavHeader />);
		expect(screen.getByText("Hono Legal")).toBeTruthy();
		const link = screen.getAllByRole("link", { name: /Hono Legal/ })[0];
		expect(link.getAttribute("href")).toBe(ROUTES.dashboard.url);
		expect(screen.queryByText("silva")).toBeNull();
		expect(screen.queryByText("v0.0.0")).toBeNull();
		fireEvent.click(link);
		expect(provider.setOpenMobile).toHaveBeenCalledWith(false);
	});

	it("renders changed provider identity without keeping the old organization", () => {
		const { rerender } = render(<NavHeader />);
		provider.organization = {
			name: "Nova Firma",
			slug: null,
			imageUrl: "https://example.com/new.png",
			reload: vi.fn(),
		};
		rerender(<NavHeader />);
		expect(screen.queryByText("Escritório Silva")).toBeNull();
		expect(screen.queryByText("silva")).toBeNull();
		expect(screen.getByRole("img").getAttribute("src")).toBe(
			provider.branding?.imageUrl,
		);
	});

	it("handles loading and missing organization", () => {
		provider.organization = null;
		provider.isLoaded = false;
		const { rerender } = render(<NavHeader />);
		expect(screen.getByText("Carregando…")).toBeTruthy();
		provider.isLoaded = true;
		rerender(<NavHeader />);
		expect(screen.getByText("Organização")).toBeTruthy();
	});

	it("refreshes on return and removes listeners on unmount", async () => {
		const reload = provider.organization?.reload;
		const { unmount } = render(<NavHeader />);
		fireEvent.focus(window);
		await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
		unmount();
		fireEvent.focus(window);
		expect(reload).toHaveBeenCalledTimes(1);
	});

	it("retains identity when provider refresh fails", async () => {
		provider.organization?.reload.mockRejectedValueOnce(new Error("offline"));
		render(<NavHeader />);
		fireEvent(document, new Event("visibilitychange"));
		await waitFor(() =>
			expect(provider.organization?.reload).toHaveBeenCalledTimes(1),
		);
		expect(screen.getByText("Escritório Silva")).toBeTruthy();
	});
});
