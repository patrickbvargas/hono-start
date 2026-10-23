import { mkdir, mkdtemp, rename, rm } from "node:fs/promises";

import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs/promises", async (importOriginal) => {
	const actual = await importOriginal<typeof import("node:fs/promises")>();
	return {
		...actual,
		lstat: vi.fn(actual.lstat),
		writeFile: vi.fn(actual.writeFile),
	};
});

import { lstat, writeFile } from "node:fs/promises";

const config = vi.hoisted(() => ({ ATTACHMENTS_DIR: "" }));

vi.mock("@/shared/config/env", () => ({ env: config }));

import {
	isAttachmentStorageCapacityError,
	readAttachmentFile,
	removeAttachmentFile,
	uploadAttachmentFile,
} from "../attachment-storage";

let root: string;

beforeEach(async () => {
	root = await mkdtemp(join(process.cwd(), "storage-test-"));
	config.ATTACHMENTS_DIR = root;
});

afterEach(async () => {
	await rm(root, { recursive: true, force: true });
});

describe("private local attachments", () => {
	it("writes, reads, relocates and deletes without Supabase", async () => {
		const path = "firms/1/client/2/test.pdf";

		await uploadAttachmentFile({
			path,
			data: Buffer.from("pdf"),
			contentType: "application/pdf",
		});

		expect((await readAttachmentFile({ path })).toString()).toBe("pdf");

		const moved = join(root, "moved");
		await mkdir(moved);
		await rename(join(root, "firms"), join(moved, "firms"));
		config.ATTACHMENTS_DIR = moved;
		expect((await readAttachmentFile({ path })).toString()).toBe("pdf");
		await removeAttachmentFile({ path });

		await expect(readAttachmentFile({ path })).rejects.toMatchObject({
			code: "ENOENT",
		});

		await expect(removeAttachmentFile({ path })).resolves.toBeUndefined();
	});

	it.each([
		"../outside",
		"/absolute",
		"firms/../../escape",
		"C:/escape",
		"firms\\..\\escape",
	])("rejects unsafe path %s", async (path) => {
		await expect(readAttachmentFile({ path })).rejects.toThrow();
	});

	it("rejects symlink escape", async () => {
		vi.mocked(lstat).mockResolvedValueOnce({
			isSymbolicLink: () => true,
		} as Awaited<ReturnType<typeof lstat>>);

		await expect(readAttachmentFile({ path: "escape/file" })).rejects.toThrow(
			"Links simbólicos",
		);
	});

	it("classifies disk capacity errors", () => {
		expect(isAttachmentStorageCapacityError({ code: "ENOSPC" })).toBe(true);

		expect(isAttachmentStorageCapacityError({ code: "EDQUOT" })).toBe(true);

		expect(isAttachmentStorageCapacityError({ code: "EACCES" })).toBe(false);
	});
});

it.each(["ENOSPC", "EACCES"])(
	"propagates filesystem %s failures without publishing a file",
	async (code) => {
		vi.mocked(writeFile).mockRejectedValueOnce(
			Object.assign(new Error("disk failure"), { code }),
		);
		const path = "firms/1/client/2/failed.pdf";
		await expect(
			uploadAttachmentFile({
				path,
				data: Buffer.from("pdf"),
				contentType: "application/pdf",
			}),
		).rejects.toMatchObject({ code });
		await expect(readAttachmentFile({ path })).rejects.toMatchObject({
			code: "ENOENT",
		});
	},
);
it("does not overwrite an existing file", async () => {
	const input = {
		path: "firms/1/client/2/existing.pdf",
		data: Buffer.from("first"),
		contentType: "application/pdf",
	};
	await uploadAttachmentFile(input);
	await expect(
		uploadAttachmentFile({ ...input, data: Buffer.from("second") }),
	).rejects.toThrow();
	expect((await readAttachmentFile({ path: input.path })).toString()).toBe(
		"first",
	);
});

it("publishes only one concurrent upload for an identity", async () => {
	const path = "firms/1/client/2/concurrent.pdf";
	const results = await Promise.allSettled(
		["first", "second"].map((value) =>
			uploadAttachmentFile({
				path,
				data: Buffer.from(value),
				contentType: "application/pdf",
			}),
		),
	);
	expect(
		results.filter((result) => result.status === "fulfilled"),
	).toHaveLength(1);
	expect(["first", "second"]).toContain(
		(await readAttachmentFile({ path })).toString(),
	);
});
