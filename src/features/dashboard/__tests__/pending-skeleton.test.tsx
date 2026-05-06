// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/components/ui", () => ({
	Card: ({
		children,
		...props
	}: {
		children: ReactNode;
		"data-testid"?: string;
		className?: string;
	}) => <div {...props}>{children}</div>,
	CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	ScrollArea: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	Skeleton: (props: ComponentProps<"div">) => <div {...props} />,
}));

vi.mock("@/shared/components/wrapper", () => ({
	Wrapper: ({ title, children }: { title?: string; children: ReactNode }) => (
		<div>
			<h1>{title}</h1>
			{children}
		</div>
	),
	WrapperBody: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	WrapperHeader: ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	),
}));

import { DashboardPendingSkeleton } from "../components/pending-skeleton";

describe("DashboardPendingSkeleton", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders dashboard loading structure aligned to the final layout", () => {
		render(<DashboardPendingSkeleton />);

		expect(screen.getByRole("heading", { name: "Dashboard" })).toBeTruthy();
		expect(screen.getByTestId("dashboard-pending-skeleton")).toBeTruthy();
		expect(screen.getByTestId("dashboard-pending-metrics")).toBeTruthy();
		expect(
			screen.getByTestId("dashboard-pending-financial-evolution"),
		).toBeTruthy();
		expect(
			screen.getByTestId("dashboard-pending-remuneration-table"),
		).toBeTruthy();
		expect(screen.getByTestId("dashboard-pending-breakdowns")).toBeTruthy();
		expect(screen.getAllByTestId("dashboard-pending-metric-card")).toHaveLength(
			3,
		);
		expect(
			screen.getAllByTestId("dashboard-pending-breakdown-card"),
		).toHaveLength(2);
	});
});
