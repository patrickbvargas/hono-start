import { createServerOnlyFn } from "@tanstack/react-start";

export const handleAttachmentFile = createServerOnlyFn(async (id: string) => {
	const { handleAttachmentFile: handler } = await import("./file");
	return handler(id);
});
