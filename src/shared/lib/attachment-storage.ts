import * as z from "zod";
import { env } from "@/shared/config/env";

function storage() {
	const { SUPABASE_URL, SUPABASE_STORAGE_BUCKET, SUPABASE_SECRET_KEY } = env;
	if (!SUPABASE_URL || !SUPABASE_STORAGE_BUCKET || !SUPABASE_SECRET_KEY) {
		throw new Error("Configuração de armazenamento de anexos indisponível");
	}
	return {
		url: `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/${encodeURIComponent(SUPABASE_STORAGE_BUCKET)}`,
		headers: { apikey: SUPABASE_SECRET_KEY },
	};
}

const storageErrorSchema = z.object({
	code: z.string().optional(),
	error: z.string().optional(),
	message: z.string().optional(),
});
async function assertStorageResponse(response: Response) {
	if (response.ok) {
		return;
	}
	const payload = storageErrorSchema.safeParse(
		await response.json().catch(() => null),
	);
	const providerCode = payload.success ? payload.data.code : undefined;
	// Only an explicit object-not-found response is safe to treat as missing.
	const missing =
		providerCode === "NoSuchKey" ||
		(payload.success &&
			payload.data.error === "not_found" &&
			payload.data.message === "Object not found");
	throw Object.assign(
		new Error("Não foi possível acessar o armazenamento de anexos"),
		{
			name: providerCode || "AttachmentStorageError",
			code: missing ? "ENOENT" : providerCode,
			status: response.status,
		},
	);
}
function objectUrl(url: string, path: string) {
	return `${url}/${path.split("/").map(encodeURIComponent).join("/")}`;
}
function validateKey(path: string) {
	if (
		!/^firms\/[1-9]\d*\/(?:demo\/)?(client|employee|contract|expense|fee|remuneration)\/[1-9]\d*\/[\w.-]+$/.test(
			path,
		) ||
		path.split("/").some((part) => part === "." || part === "..")
	) {
		throw new Error("Caminho de anexo inválido");
	}
	return path;
}
export function isAttachmentStorageCapacityError(error: unknown) {
	return (error as { name?: string })?.name === "QuotaExceeded";
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
	contentType,
}: {
	contentType: string;
	data: Buffer;
	path: string;
}) {
	const key = validateKey(path);
	const { url, headers } = storage();
	try {
		await assertStorageResponse(
			await fetch(objectUrl(url, key), {
				method: "POST",
				headers: {
					...headers,
					"Content-Type": contentType,
					"x-upsert": "false",
				},
				body: new Uint8Array(data),
				redirect: "error",
			}),
		);
	} catch (error) {
		console.error("[attachment:upload]", { storagePath: key, error });
		throw error;
	}
}
export async function readAttachmentFile({ path }: { path: string }) {
	const key = validateKey(path);
	const { url, headers } = storage();
	const response = await fetch(objectUrl(url, key), {
		headers,
		redirect: "error",
		cache: "no-store",
	});
	await assertStorageResponse(response);
	return Buffer.from(await response.arrayBuffer());
}
export async function removeAttachmentFile({ path }: { path: string }) {
	const key = validateKey(path);
	const { url, headers } = storage();
	const response = await fetch(url, {
		method: "DELETE",
		headers: { ...headers, "Content-Type": "application/json" },
		body: JSON.stringify({ prefixes: [key] }),
		redirect: "error",
	});
	try {
		await assertStorageResponse(response);
	} catch (error) {
		if ((error as { code?: string }).code !== "ENOENT") {
			throw error;
		}
	}
}
