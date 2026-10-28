import { useMatches } from "@tanstack/react-router";
import { getPageTitle } from "@/shared/config/routes";
import { useApplicationBranding } from "../../hooks/use-application-branding";
import { useFavicon } from "../../hooks/use-favicon";

export function ApplicationBrandingHead() {
	const pageTitle = useMatches({
		select: (matches) =>
			matches.reduce<string | undefined>(
				(title, match) => match.staticData.pageTitle ?? title,
				undefined,
			),
	});
	const branding = useApplicationBranding();
	const faviconUrl = useFavicon(branding.faviconUrl);

	return (
		<>
			<title>{getPageTitle(pageTitle, branding.name)}</title>
			<link rel="icon" href={faviconUrl} />
		</>
	);
}
