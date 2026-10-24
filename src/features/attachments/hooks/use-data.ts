import { useQuery } from "@tanstack/react-query";
import { getAttachmentsByOwnerQueryOptions } from "../api/queries";
import type { AttachmentOwnerInput } from "../schemas/form";

export function useAttachments(owner: AttachmentOwnerInput) {
	const {
		data: attachments,
		error,
		isPending,
		refetch,
	} = useQuery(getAttachmentsByOwnerQueryOptions(owner));

	return {
		retry: () => {
			void refetch();
		},
		attachments: attachments ?? [],
		error,
		isPending,
	};
}
