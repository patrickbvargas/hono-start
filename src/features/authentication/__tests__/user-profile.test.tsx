// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { openUserProfile } = vi.hoisted(() => ({ openUserProfile: vi.fn() }));
vi.mock("@clerk/tanstack-react-start", () => ({
	useClerk: () => ({ openUserProfile }),
}));

import { useUserProfile } from "../hooks/use-user-profile";

describe("native account profile", () => {
	it("opens the Clerk modal on each request without passing a click event", () => {
		const { result } = renderHook(() => useUserProfile());
		act(() => result.current.handleOpenUserProfile());
		act(() => result.current.handleOpenUserProfile());
		expect(openUserProfile).toHaveBeenCalledTimes(2);
		expect(openUserProfile).toHaveBeenNthCalledWith(1);
		expect(openUserProfile).toHaveBeenNthCalledWith(2);
	});
});
