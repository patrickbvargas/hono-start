export const ATTACHMENT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const ATTACHMENT_ACCEPT_ATTRIBUTE = ".pdf,.jpg,.jpeg,.png";
export const ATTACHMENT_OWNER_KINDS = [
	"client",
	"employee",
	"contract",
] as const;
export const ATTACHMENT_ALLOWED_MIME_TYPE_BY_VALUE = {
	PDF: ["application/pdf"],
	JPG: ["image/jpeg", "image/jpg"],
	PNG: ["image/png"],
} as const;
