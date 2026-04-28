import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
	getAttachmentsByOwnerQueryOptions,
	getAttachmentTypesQueryOptions,
} from "../api/queries";
import type { AttachmentOwnerInput } from "../schemas/form";

export function useAttachments(owner: AttachmentOwnerInput) {
	const {
		data: attachments,
		error,
		isPending,
	} = useQuery(getAttachmentsByOwnerQueryOptions(owner));

	return {
		attachments: attachments ?? [],
		error,
		isPending,
	};
}

export function useAttachmentOptions() {
	const { data: types } = useSuspenseQuery(getAttachmentTypesQueryOptions());

	return { types };
}
