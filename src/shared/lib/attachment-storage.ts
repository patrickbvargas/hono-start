import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { env } from "@/shared/config/env";

function storage() {
	const {
		CLOUDFLARE_ACCOUNT_ID,
		CLOUDFLARE_R2_BUCKET_NAME,
		CLOUDFLARE_R2_ACCESS_KEY_ID,
		CLOUDFLARE_R2_SECRET_ACCESS_KEY,
	} = env;
	if (
		!CLOUDFLARE_ACCOUNT_ID ||
		!CLOUDFLARE_R2_BUCKET_NAME ||
		!CLOUDFLARE_R2_ACCESS_KEY_ID ||
		!CLOUDFLARE_R2_SECRET_ACCESS_KEY
	) {
		throw new Error("Configuração de armazenamento de anexos indisponível");
	}
	return {
		bucket: CLOUDFLARE_R2_BUCKET_NAME,
		client: new S3Client({
			region: "auto",
			endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: CLOUDFLARE_R2_ACCESS_KEY_ID,
				secretAccessKey: CLOUDFLARE_R2_SECRET_ACCESS_KEY,
			},
			maxAttempts: 1,
		}),
	};
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
	const Key = validateKey(path);
	const { client, bucket } = storage();
	try {
		await client.send(
			new PutObjectCommand({
				Bucket: bucket,
				Key,
				Body: data,
				ContentType: contentType,
				IfNoneMatch: "*",
			}),
		);
	} catch (error) {
		// A network failure can leave a committed object. Retain identity for manual reconciliation.
		console.error("[attachment:upload]", { storagePath: Key, error });
		throw error;
	} finally {
		client.destroy();
	}
}
export async function readAttachmentFile({ path }: { path: string }) {
	const Key = validateKey(path);
	const { client, bucket } = storage();
	try {
		const response = await client.send(
			new GetObjectCommand({ Bucket: bucket, Key }),
		);
		if (!response.Body) {
			throw new Error("Resposta de armazenamento inválida");
		}
		return Buffer.from(await response.Body.transformToByteArray());
	} catch (error) {
		if ((error as { name?: string })?.name === "NoSuchKey") {
			throw Object.assign(new Error("Anexo não encontrado"), {
				code: "ENOENT",
			});
		}
		throw error;
	} finally {
		client.destroy();
	}
}
export async function removeAttachmentFile({ path }: { path: string }) {
	const Key = validateKey(path);
	const { client, bucket } = storage();
	try {
		await client.send(new DeleteObjectCommand({ Bucket: bucket, Key }));
	} finally {
		client.destroy();
	}
}
