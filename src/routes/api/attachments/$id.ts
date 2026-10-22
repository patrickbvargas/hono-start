import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/api/attachments/$id")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const { handleAttachmentFile } = await import("@/features/attachments");
				return handleAttachmentFile(params.id);
			},
		},
	},
});
