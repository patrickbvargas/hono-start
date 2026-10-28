import { useQuery } from "@tanstack/react-query";
import {
	getAttachmentFileQueryOptions,
	getAttachmentsByOwnerQueryOptions,
} from "../api/queries";
import type { AttachmentOwnerInput } from "../schemas/form";
import type { AttachmentSummary } from "../schemas/model";

export function useAttachmentFile(attachment: AttachmentSummary) {
	const { data, error, isFetching, refetch } = useQuery(
		getAttachmentFileQueryOptions(attachment),
	);
	return { file: data, error, isFetching, refetch };
}

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
