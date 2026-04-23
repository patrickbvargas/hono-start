import { useQuery } from "@tanstack/react-query";
import { getAttachmentTypesQueryOptions } from "../api/queries";

export function useAttachmentOptions() {
	return useQuery(getAttachmentTypesQueryOptions());
}
