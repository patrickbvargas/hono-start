import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	session: vi.fn(),
	scope: vi.fn(),
	attachment: vi.fn(),
	owner: vi.fn(),
	access: vi.fn(),
	read: vi.fn(),
}));
vi.mock("@/shared/session/server", () => ({
	getRequiredServerLoggedUserSession: mocks.session,
	getServerScope: mocks.scope,
}));
vi.mock("../data/queries", () => ({
	getAttachmentAccessById: mocks.attachment,
	assertAttachmentOwnerExists: mocks.owner,
}));
vi.mock("../rules/access", () => ({
	assertAttachmentOwnerReadAccess: mocks.access,
}));
vi.mock("@/shared/lib/attachment-storage", () => ({
	readAttachmentFile: mocks.read,
}));

import { handleAttachmentFile } from "../api/file";

beforeEach(() => {
	vi.resetAllMocks();
	mocks.session.mockResolvedValue({});
	mocks.scope.mockResolvedValue({ firmId: 1 });
	mocks.attachment.mockResolvedValue({
		id: 2,
		fileName: "test.pdf",
		mimeType: "application/pdf",
		storagePath: "private",
		ownerInput: { clientId: 3 },
	});
	mocks.owner.mockResolvedValue({});
	mocks.read.mockResolvedValue(Buffer.from("pdf"));
});
it("delivers only after owner authorization with private headers", async () => {
	const response = await handleAttachmentFile("2");
	expect(response.status).toBe(200);
	expect(await response.text()).toBe("pdf");
	expect(response.headers.get("Cache-Control")).toBe("private, no-store");
	expect(mocks.attachment).toHaveBeenCalledWith(1, 2);
	expect(mocks.access).toHaveBeenCalled();
});
it("denies absent sessions before disk access", async () => {
	mocks.session.mockRejectedValue(new Error("unauthenticated"));
	expect((await handleAttachmentFile("2")).status).toBe(403);
	expect(mocks.read).not.toHaveBeenCalled();
});
it("denies forbidden owners before disk access", async () => {
	mocks.access.mockImplementation(() => {
		throw new Error("forbidden");
	});
	expect((await handleAttachmentFile("2")).status).toBe(403);
	expect(mocks.read).not.toHaveBeenCalled();
});
it("does not deliver cross-firm or absent records", async () => {
	mocks.attachment.mockResolvedValue(null);
	expect((await handleAttachmentFile("2")).status).toBe(404);
	expect(mocks.read).not.toHaveBeenCalled();
});
it("handles absent binaries without exposing disk paths", async () => {
	mocks.read.mockRejectedValue({ code: "ENOENT", path: "secret" });
	const response = await handleAttachmentFile("2");
	expect(response.status).toBe(404);
	expect(await response.text()).not.toContain("secret");
});
