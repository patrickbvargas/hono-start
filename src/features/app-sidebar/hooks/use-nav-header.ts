import { useClerk, useOrganization } from "@clerk/tanstack-react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSidebar } from "@/shared/components/ui";
import { getApplicationBrandingQueryOptions } from "../api/queries";

export function useNavHeader() {
	const { organization, isLoaded } = useOrganization();
	const clerk = useClerk();
	const { data: branding } = useQuery(
		getApplicationBrandingQueryOptions(clerk.frontendApi),
	);
	const { setOpenMobile } = useSidebar();

	useEffect(() => {
		if (!organization) {
			return;
		}

		let isRefreshing = false;
		const refresh = async () => {
			if (document.visibilityState !== "visible" || isRefreshing) {
				return;
			}
			isRefreshing = true;
			try {
				await organization.reload();
			} catch {
				// Retain provider data until the next successful refresh.
			} finally {
				isRefreshing = false;
			}
		};

		window.addEventListener("focus", refresh);
		document.addEventListener("visibilitychange", refresh);
		return () => {
			window.removeEventListener("focus", refresh);
			document.removeEventListener("visibilitychange", refresh);
		};
	}, [organization]);

	const name = branding?.name || "Hono";
	return {
		name,
		organizationName:
			organization?.name || (isLoaded ? "Organização" : "Carregando…"),
		imageUrl: branding?.imageUrl,
		initials: name
			.split(" ")
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? "")
			.join(""),
		handleNavigate: () => setOpenMobile(false),
	};
}
