import { useQuery } from "@tanstack/react-query";
import { getApplicationBrandingQueryOptions } from "../api/queries";
import { DEFAULT_APPLICATION_BRANDING } from "../schemas/model";

export function useApplicationBranding() {
	const { data } = useQuery(getApplicationBrandingQueryOptions());
	return data ?? DEFAULT_APPLICATION_BRANDING;
}
