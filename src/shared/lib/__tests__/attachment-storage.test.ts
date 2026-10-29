import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	fetch: vi.fn(),
	config: {
		SUPABASE_URL: "https://test.supabase.co",
		SUPABASE_STORAGE_BUCKET: "private",
		SUPABASE_SECRET_KEY: "sb_secret_test",
	},
}));
vi.mock("@/shared/config/env", () => ({ env: mocks.config }));

import {
	isAttachmentStorageCapacityError,
	readAttachmentFile,
	removeAttachmentFile,
	uploadAttachmentFile,
} from "../attachment-storage";

const path = "firms/1/client/2/test.pdf";
const upload = () =>
	uploadAttachmentFile({
		path,
		data: Buffer.from("pdf"),
		contentType: "application/pdf",
	});
beforeEach(() => {
	vi.clearAllMocks();
	vi.stubGlobal("fetch", mocks.fetch);
	mocks.fetch.mockImplementation(async () => new Response("pdf"));
});
afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});
it("uploads without overwrite using server secret", async () => {
	await upload();
	expect(mocks.fetch).toHaveBeenCalledWith(
		`https://test.supabase.co/storage/v1/object/private/${path}`,
		expect.objectContaining({
			method: "POST",
			headers: {
				apikey: "sb_secret_test",
				"Content-Type": "application/pdf",
				"x-upsert": "false",
			},
			redirect: "error",
		}),
	);
});
it("reads bytes without caching", async () => {
	expect(await readAttachmentFile({ path })).toEqual(Buffer.from("pdf"));
	expect(mocks.fetch.mock.calls[0][1].cache).toBe("no-store");
});
it.each([
	"NoSuchKey",
	"AccessDenied",
	"NoSuchBucket",
	"InternalError",
	"ResourceAlreadyExists",
	"QuotaExceeded",
])("classifies %s safely", async (code) => {
	mocks.fetch.mockResolvedValueOnce(
		Response.json(
			{ code, message: "secret provider detail" },
			{ status: code === "NoSuchKey" ? 404 : 400 },
		),
	);
	await expect(readAttachmentFile({ path })).rejects.toMatchObject({
		code: code === "NoSuchKey" ? "ENOENT" : code,
		message: "Não foi possível acessar o armazenamento de anexos",
	});
	expect(isAttachmentStorageCapacityError({ name: code })).toBe(
		code === "QuotaExceeded",
	);
});
it("deletes exact key and accepts missing objects", async () => {
	mocks.fetch.mockResolvedValueOnce(
		Response.json({ code: "NoSuchKey" }, { status: 404 }),
	);
	await removeAttachmentFile({ path });
	expect(mocks.fetch.mock.calls[0][1].body).toBe(
		JSON.stringify({ prefixes: [path] }),
	);
});
it("fails missing configuration before request", async () => {
	const bucket = mocks.config.SUPABASE_STORAGE_BUCKET;
	mocks.config.SUPABASE_STORAGE_BUCKET = "";
	try {
		await expect(upload()).rejects.toThrow("Configuração");
		expect(mocks.fetch).not.toHaveBeenCalled();
	} finally {
		mocks.config.SUPABASE_STORAGE_BUCKET = bucket;
	}
});
it.each([
	"../outside",
	"/absolute",
	"C:/escape",
	"firms/1/client/2/..",
	"firms\\1\\client\\2\\test",
	"firms/1/client/2/a/b",
	"firms/1/unknown/2/file",
])("rejects invalid key %s", async (path) => {
	await expect(readAttachmentFile({ path })).rejects.toThrow("Caminho");
	expect(mocks.fetch).not.toHaveBeenCalled();
});
it("records unknown upload outcome without retry", async () => {
	const log = vi.spyOn(console, "error").mockImplementation(() => {});
	mocks.fetch.mockRejectedValueOnce(new Error("network unavailable"));
	await expect(upload()).rejects.toThrow("network unavailable");
	expect(mocks.fetch).toHaveBeenCalledTimes(1);
	expect(log).toHaveBeenCalledWith(
		"[attachment:upload]",
		expect.objectContaining({ storagePath: path }),
	);
});
it("accepts existing demo keys", async () => {
	await removeAttachmentFile({ path: "firms/1/demo/client/2/documento.png" });
	expect(mocks.fetch).toHaveBeenCalledTimes(1);
});
it("does not classify ambiguous 404 or malformed failures as missing", async () => {
	mocks.fetch.mockResolvedValueOnce(
		new Response("unavailable", { status: 404 }),
	);
	await expect(readAttachmentFile({ path })).rejects.toMatchObject({
		name: "AttachmentStorageError",
		code: undefined,
	});
});
