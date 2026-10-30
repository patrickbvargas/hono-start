import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Option } from "@/shared/schemas/option";

const mocks = vi.hoisted(() => ({ users: vi.fn(), profiles: vi.fn() }));
vi.mock("@clerk/tanstack-react-start/server", () => ({
	clerkClient: () => ({ users: { getUserList: mocks.users } }),
}));
vi.mock("@tanstack/react-start", () => ({
	createServerOnlyFn: (fn: unknown) => fn,
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: { employeeProfile: { findMany: mocks.profiles } },
}));
const options: Option[] = [
	{ id: 1, value: "1", label: "Ana Silva", isDisabled: false },
	{ id: 2, value: "2", label: "Bruno", isDisabled: true },
];
function user(personId: unknown, imageUrl = "https://img.clerk.com/photo.png") {
	return { privateMetadata: { personId }, imageUrl, hasImage: true };
}

describe("optional Clerk employee avatars", () => {
	beforeEach(() => {
		vi.resetModules();
		mocks.users.mockReset();
		mocks.profiles.mockResolvedValue([
			{ id: 1, personId: 1 },
			{ id: 2, personId: 2 },
		]);
	});
	afterEach(() => vi.restoreAllMocks());

	it("paginates and enriches only existing options without exposing account metadata", async () => {
		mocks.users
			.mockResolvedValueOnce({ data: [user(1)], totalCount: 3 })
			.mockResolvedValueOnce({ data: [user(2), user(99)], totalCount: 3 });
		const { enrichEmployeeAvatars } = await import("../data/employee-avatars");
		expect(await enrichEmployeeAvatars(options)).toEqual(
			options.map((option) => ({
				...option,
				imageUrl: "https://img.clerk.com/photo.png",
			})),
		);
		expect(mocks.users.mock.calls).toEqual([
			[{ limit: 100, offset: 0, orderBy: "+created_at" }],
			[{ limit: 100, offset: 1, orderBy: "+created_at" }],
		]);
	});

	it("ignores malformed links, unsafe URLs, missing photos and duplicate bindings across pages", async () => {
		mocks.users
			.mockResolvedValueOnce({
				data: [user("1"), user(-1), user(1), user(2, "javascript:alert(1)")],
				totalCount: 7,
			})
			.mockResolvedValueOnce({
				data: [user(1), user(1), { ...user(2), hasImage: false }],
				totalCount: 7,
			});
		const { enrichEmployeeAvatars } = await import("../data/employee-avatars");
		expect(await enrichEmployeeAvatars(options)).toEqual(options);
	});

	it("deduplicates concurrent loads and refreshes photos after the cache expires", async () => {
		let now = 1_000;
		vi.spyOn(Date, "now").mockImplementation(() => now);
		mocks.users.mockResolvedValue({ data: [user(1)], totalCount: 1 });
		const { enrichEmployeeAvatars } = await import("../data/employee-avatars");
		await Promise.all([
			enrichEmployeeAvatars(options),
			enrichEmployeeAvatars(options),
		]);
		await enrichEmployeeAvatars(options);
		expect(mocks.users).toHaveBeenCalledTimes(1);
		now += 60_001;
		mocks.users.mockResolvedValue({ data: [], totalCount: 0 });
		expect(await enrichEmployeeAvatars(options)).toEqual(options);
		expect(mocks.users).toHaveBeenCalledTimes(2);
	});

	it("discards partial results on failure, cools down and then retries", async () => {
		let now = 1_000;
		vi.spyOn(Date, "now").mockImplementation(() => now);
		mocks.users
			.mockResolvedValueOnce({ data: [user(1)], totalCount: 2 })
			.mockRejectedValueOnce(new Error("Clerk unavailable"));
		const { enrichEmployeeAvatars } = await import("../data/employee-avatars");
		expect(await enrichEmployeeAvatars(options)).toEqual(options);
		expect(await enrichEmployeeAvatars(options)).toEqual(options);
		expect(mocks.users).toHaveBeenCalledTimes(2);
		now += 10_001;
		mocks.users.mockResolvedValue({ data: [user(1)], totalCount: 1 });
		expect((await enrichEmployeeAvatars(options))[0].imageUrl).toBe(
			"https://img.clerk.com/photo.png",
		);
	});

	it("avoids provider calls for empty authorized option lists", async () => {
		const { enrichEmployeeAvatars } = await import("../data/employee-avatars");
		expect(await enrichEmployeeAvatars([])).toEqual([]);
		expect(mocks.users).not.toHaveBeenCalled();
	});
	it("maps distinct Person IDs to authorized EmployeeProfile options", async () => {
		mocks.users.mockResolvedValue({ data: [user(1000)], totalCount: 1 });
		mocks.profiles.mockResolvedValue([{ id: 1, personId: 1000 }]);
		const { enrichEmployeeAvatars } = await import("../data/employee-avatars");
		expect((await enrichEmployeeAvatars(options))[0].imageUrl).toBe(
			"https://img.clerk.com/photo.png",
		);
		expect((await enrichEmployeeAvatars(options))[1].imageUrl).toBeUndefined();
	});
});
