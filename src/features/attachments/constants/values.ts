export const ATTACHMENT_MAX_OWNER_FILES = 10;
export const ATTACHMENT_MAX_BATCH_FILES = ATTACHMENT_MAX_OWNER_FILES;
export const ATTACHMENT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const ATTACHMENT_ACCEPT_ATTRIBUTE = ".pdf,.jpg,.jpeg,.png";
export const ATTACHMENT_OWNER_KINDS = [
	"client",
	"employee",
	"contract",
	"expense",
	"fee",
	"remuneration",
] as const;
export const ATTACHMENT_ALLOWED_MIME_TYPE_BY_VALUE = {
	PDF: ["application/pdf"],
	JPG: ["image/jpeg", "image/jpg"],
	PNG: ["image/png"],
} as const;
