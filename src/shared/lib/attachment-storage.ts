import { env } from "@/shared/config/env";

const STORAGE_ERROR = "Configuração de armazenamento de anexos indisponível";
const SIGNED_URL_TTL_SECONDS = 60 * 60;
const STORAGE_CAPACITY_ERROR_PATTERNS = [
	"quota",
	"capacity",
	"limit exceeded",
	"insufficient storage",
	"storage full",
	"out of space",
] as const;

type AttachmentStorageErrorCode = "capacity_exceeded" | "unknown";

interface AttachmentStorageConfig {
	baseUrl: string;
	bucket: string;
	serviceKey: string;
}

interface UploadAttachmentFileParams {
	contentType: string;
	data: Buffer;
	path: string;
}

interface RemoveAttachmentFileParams {
	path: string;
}

interface CreateAttachmentSignedUrlParams {
	path: string;
}

class AttachmentStorageError extends Error {
	code: AttachmentStorageErrorCode;
	status?: number;

	constructor(params: {
		code: AttachmentStorageErrorCode;
		message: string;
		status?: number;
	}) {
		super(params.message);
		this.name = "AttachmentStorageError";
		this.code = params.code;
		this.status = params.status;
	}
}

function getAttachmentStorageConfig(): AttachmentStorageConfig {
	if (!env.SUPABASE_URL || !env.SUPABASE_STORAGE_SERVICE_KEY) {
		throw new Error(STORAGE_ERROR);
	}

	return {
		baseUrl: env.SUPABASE_URL.replace(/\/$/, ""),
		bucket: env.SUPABASE_STORAGE_BUCKET,
		serviceKey: env.SUPABASE_STORAGE_SERVICE_KEY,
	};
}

function createAuthHeaders(config: AttachmentStorageConfig) {
	return {
		apikey: config.serviceKey,
		Authorization: `Bearer ${config.serviceKey}`,
	};
}

async function readErrorMessage(response: Response) {
	try {
		const data = (await response.json()) as {
			error?: string;
			message?: string;
		};
		return data.message ?? data.error ?? response.statusText;
	} catch {
		return response.statusText;
	}
}

function isStorageCapacityError(params: { message: string; status: number }) {
	if ([413, 507, 509].includes(params.status)) {
		return true;
	}

	const normalizedMessage = params.message.trim().toLowerCase();

	return STORAGE_CAPACITY_ERROR_PATTERNS.some((pattern) =>
		normalizedMessage.includes(pattern),
	);
}

function createAttachmentStorageError(response: Response, message: string) {
	return new AttachmentStorageError({
		code: isStorageCapacityError({
			message,
			status: response.status,
		})
			? "capacity_exceeded"
			: "unknown",
		message,
		status: response.status,
	});
}

export function isAttachmentStorageCapacityError(error: unknown) {
	return (
		error instanceof AttachmentStorageError &&
		error.code === "capacity_exceeded"
	);
}

export function createAttachmentStoragePath(params: {
	firmId: number;
	ownerId: number;
	ownerKind: "client" | "contract" | "employee";
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
	contentType,
	data,
	path,
}: UploadAttachmentFileParams) {
	const config = getAttachmentStorageConfig();
	const body = new Uint8Array(data);
	const response = await fetch(
		`${config.baseUrl}/storage/v1/object/${config.bucket}/${path}`,
		{
			method: "POST",
			headers: {
				...createAuthHeaders(config),
				"Content-Type": contentType,
				"x-upsert": "false",
			},
			body,
		},
	);

	if (!response.ok) {
		const message = await readErrorMessage(response);
		throw createAttachmentStorageError(response, message);
	}
}

export async function removeAttachmentFile({
	path,
}: RemoveAttachmentFileParams) {
	const config = getAttachmentStorageConfig();
	const response = await fetch(
		`${config.baseUrl}/storage/v1/object/${config.bucket}/${path}`,
		{
			method: "DELETE",
			headers: createAuthHeaders(config),
		},
	);

	if (!response.ok && response.status !== 404) {
		const message = await readErrorMessage(response);
		throw createAttachmentStorageError(response, message);
	}
}

export async function createAttachmentSignedUrl({
	path,
}: CreateAttachmentSignedUrlParams) {
	try {
		const config = getAttachmentStorageConfig();
		const response = await fetch(
			`${config.baseUrl}/storage/v1/object/sign/${config.bucket}/${path}`,
			{
				method: "POST",
				headers: {
					...createAuthHeaders(config),
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ expiresIn: SIGNED_URL_TTL_SECONDS }),
			},
		);

		if (!response.ok) {
			const message = await readErrorMessage(response);
			throw createAttachmentStorageError(response, message);
		}

		const payload = (await response.json()) as {
			signedURL?: string;
			signedUrl?: string;
		};
		const signedUrl = payload.signedURL ?? payload.signedUrl;

		if (!signedUrl) {
			return null;
		}

		return signedUrl.startsWith("http")
			? signedUrl
			: `${config.baseUrl}/storage/v1${signedUrl}`;
	} catch (error) {
		console.error("[createAttachmentSignedUrl]", error);
		return null;
	}
}
