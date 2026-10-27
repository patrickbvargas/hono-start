import { OrganizationSwitcher as ClerkOrganizationSwitcher } from "@clerk/tanstack-react-start";

interface OrganizationSwitcherProps {
	organizationName: string;
}

export function OrganizationSwitcher({
	organizationName,
}: OrganizationSwitcherProps) {
	return (
		<ClerkOrganizationSwitcher
			hidePersonal
			afterSelectOrganizationUrl="/"
			afterLeaveOrganizationUrl="/login"
			fallback={
				<span className="truncate text-xs text-muted-foreground">
					{organizationName}
				</span>
			}
			appearance={{
				elements: {
					rootBox: "w-full min-w-0",
					organizationSwitcherTrigger:
						"w-full min-w-0 justify-start gap-1! p-0! text-xs text-muted-foreground",
					organizationPreviewAvatarBox__organizationSwitcherTrigger: "hidden!",
					organizationPreviewAvatarContainer__organizationSwitcherTrigger:
						"hidden!",
					organizationPreview__organizationSwitcherTrigger: "min-w-0 gap-0!",
					organizationPreviewTextContainer__organizationSwitcherTrigger:
						"min-w-0",
					organizationPreviewMainIdentifier__organizationSwitcherTrigger:
						"truncate text-xs font-normal text-muted-foreground",
				},
			}}
		/>
	);
}
