import { OrganizationSwitcher as ClerkOrganizationSwitcher } from "@clerk/tanstack-react-start";

import { ClerkStatus } from "../clerk-status";

interface OrganizationSwitcherProps {
	organizationName: string;
}

export function OrganizationSwitcher({
	organizationName,
}: OrganizationSwitcherProps) {
	const fallback = (
		<span className="block h-4.5 truncate text-xs leading-4.5 text-muted-foreground">
			{organizationName}
		</span>
	);
	return (
		<ClerkStatus loadingFallback={fallback}>
			<ClerkOrganizationSwitcher
				hidePersonal
				afterSelectOrganizationUrl="/"
				afterLeaveOrganizationUrl="/login"
				fallback={fallback}
				appearance={{
					elements: {
						rootBox: "h-4.5 w-full min-w-0",
						organizationSwitcherTrigger:
							"h-4.5! min-h-0! w-full min-w-0 justify-start gap-1! p-0! text-xs leading-4.5! text-muted-foreground",
						organizationPreviewAvatarBox__organizationSwitcherTrigger:
							"hidden!",
						organizationPreviewAvatarContainer__organizationSwitcherTrigger:
							"hidden!",
						organizationPreview__organizationSwitcherTrigger: "min-w-0 gap-0!",
						organizationPreviewTextContainer__organizationSwitcherTrigger:
							"min-w-0",
						organizationPreviewMainIdentifier__organizationSwitcherTrigger:
							"truncate text-xs leading-4.5! font-normal text-muted-foreground",
					},
				}}
			/>
		</ClerkStatus>
	);
}
