import {
	link,
	lstat,
	mkdir,
	readFile,
	unlink,
	writeFile,
} from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { env } from "@/shared/config/env";

function code(error: unknown) {
	return (error as NodeJS.ErrnoException)?.code;
}
export function isAttachmentStorageCapacityError(error: unknown) {
	return ["ENOSPC", "EDQUOT"].includes(code(error) ?? "");
}
async function localPath(path: string) {
	if (!env.ATTACHMENTS_DIR) {
		throw new Error("Configuração de armazenamento de anexos indisponível");
	}
	if (
		isAbsolute(path) ||
		path
			.split(/[\\/]/)
			.some((part) => !part || part === "." || part === "..") ||
		path.includes(":")
	) {
		throw new Error("Caminho de anexo inválido");
	}
	const root = resolve(env.ATTACHMENTS_DIR);
	// Inspect every existing ancestor, including the root, before any file operation.
	const target = join(root, path);
	let current = resolve(root, "/");
	const parts = target.slice(current.length).split(/[\\/]/).filter(Boolean);
	for (const part of parts) {
		current = join(current, part);
		try {
			if ((await lstat(current)).isSymbolicLink()) {
				throw new Error("Links simbólicos não são permitidos nos anexos");
			}
		} catch (error) {
			if (code(error) !== "ENOENT") {
				throw error;
			}
		}
	}
	return target;
}
export function createAttachmentStoragePath(params: {
	firmId: number;
	ownerId: number;
	ownerKind:
		| "client"
		| "contract"
		| "employee"
		| "expense"
		| "fee"
		| "remuneration";
	fileName: string;
}) {
	const sanitizedName = params.fileName
		.normalize("NFKD")
		.replace(/[^\w.-]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
		.toLowerCase();
	return [
		"firms",
		String(params.firmId),
		params.ownerKind,
		String(params.ownerId),
		`${crypto.randomUUID()}-${sanitizedName || "arquivo"}`,
	].join("/");
}
export async function uploadAttachmentFile({
	data,
	path,
}: {
	contentType: string;
	data: Buffer;
	path: string;
}) {
	const target = await localPath(path);
	await mkdir(dirname(target), { recursive: true });
	const temporary = `${target}.${crypto.randomUUID()}.tmp`;
	try {
		await writeFile(temporary, data, { flag: "wx", mode: 0o600 });
		// Publish complete bytes atomically without replacing another upload.
		await link(temporary, target);
	} finally {
		await unlink(temporary).catch((error) => {
			if (code(error) !== "ENOENT") {
				console.error("[attachment:cleanup]", error);
			}
		});
	}
}
export async function readAttachmentFile({ path }: { path: string }) {
	return readFile(await localPath(path));
}
export async function removeAttachmentFile({ path }: { path: string }) {
	try {
		await unlink(await localPath(path));
	} catch (error) {
		if (code(error) !== "ENOENT") {
			throw error;
		}
	}
}
