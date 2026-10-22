import { createServerOnlyFn } from "@tanstack/react-start";

export * from "./components/section";

export const handleAttachmentFile = createServerOnlyFn(async (id: string) => {
	const { handleAttachmentFile: handler } = await import("./api/file");
	return handler(id);
});
