import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	send: vi.fn(),
	destroy: vi.fn(),
	config: {
		CLOUDFLARE_ACCOUNT_ID: "a".repeat(32),
		CLOUDFLARE_R2_BUCKET_NAME: "test-private",
		CLOUDFLARE_R2_ACCESS_KEY_ID: "test",
		CLOUDFLARE_R2_SECRET_ACCESS_KEY: "test",
	},
}));
vi.mock("@/shared/config/env", () => ({ env: mocks.config }));
vi.mock("@aws-sdk/client-s3", async (original) => ({
	...(await original<typeof import("@aws-sdk/client-s3")>()),
	S3Client: class {
		send = mocks.send;
		destroy = mocks.destroy;
	},
}));

import {
	readAttachmentFile,
	removeAttachmentFile,
	uploadAttachmentFile,
} from "../attachment-storage";

beforeEach(() => {
	vi.clearAllMocks();
});
const path = "firms/1/client/2/test.pdf";
it("uploads privately with conditional publication and recorded MIME", async () => {
	await uploadAttachmentFile({
		path,
		data: Buffer.from("pdf"),
		contentType: "application/pdf",
	});
	expect(mocks.send.mock.calls[0][0].input).toMatchObject({
		Bucket: "test-private",
		Key: path,
		ContentType: "application/pdf",
		IfNoneMatch: "*",
	});
	expect(mocks.send.mock.calls[0][0].input.ACL).toBeUndefined();
	expect(mocks.destroy).toHaveBeenCalled();
});
it("reads object bytes without filesystem dependency", async () => {
	mocks.send.mockResolvedValueOnce({
		Body: { transformToByteArray: async () => new Uint8Array([1, 2]) },
	});
	expect(await readAttachmentFile({ path })).toEqual(Buffer.from([1, 2]));
});
it("maps missing objects to controlled not-found", async () => {
	mocks.send.mockRejectedValueOnce({ name: "NoSuchKey" });
	await expect(readAttachmentFile({ path })).rejects.toMatchObject({
		code: "ENOENT",
	});
});
it("does not hide access failures as missing objects", async () => {
	mocks.send.mockRejectedValueOnce({ name: "AccessDenied" });
	await expect(readAttachmentFile({ path })).rejects.toMatchObject({
		name: "AccessDenied",
	});
});
it("deletes through private bucket", async () => {
	await removeAttachmentFile({ path });
	expect(mocks.send.mock.calls[0][0].input).toEqual({
		Bucket: "test-private",
		Key: path,
	});
});
it.each([
	"../outside",
	"/absolute",
	"C:/escape",
	"firms/1/client/2/..",
	"firms\\1\\client\\2\\test",
	"firms/1/client/2/a/b",
	"firms/1/unknown/2/file",
])("rejects invalid key before accessing R2: %s", async (path) => {
	await expect(readAttachmentFile({ path })).rejects.toThrow("Caminho");
	expect(mocks.send).not.toHaveBeenCalled();
});
it("preserves storage errors for feature compensation", async () => {
	mocks.send.mockRejectedValueOnce(new Error("unavailable"));
	await expect(
		uploadAttachmentFile({
			path,
			data: Buffer.from("pdf"),
			contentType: "application/pdf",
		}),
	).rejects.toThrow("unavailable");
	expect(mocks.destroy).toHaveBeenCalled();
});

it("accepts existing demo object identities", async () => {
	await removeAttachmentFile({
		path: "firms/1/demo/client/2/documento-demonstrativo.png",
	});
	expect(mocks.send.mock.calls[0][0].input.Key).toBe(
		"firms/1/demo/client/2/documento-demonstrativo.png",
	);
});
