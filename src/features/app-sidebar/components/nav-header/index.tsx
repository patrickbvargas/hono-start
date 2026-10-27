import { Link } from "@tanstack/react-router";
import { OrganizationSwitcher } from "@/features/authentication";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	SidebarMenu,
	SidebarMenuItem,
} from "@/shared/components/ui";
import { ROUTES } from "@/shared/config/routes";
import { useNavHeader } from "../../hooks/use-nav-header";

export const NavHeader = () => {
	const { name, organizationName, imageUrl, initials, handleNavigate } =
		useNavHeader();
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<div className="flex h-12 min-w-0 items-center gap-2 p-2 group-data-[collapsible=icon]:p-0">
					<Link
						to={ROUTES.dashboard.url}
						onClick={handleNavigate}
						title={name}
						aria-label={name}
						className="shrink-0 rounded-lg focus-visible:outline-ring"
					>
						<Avatar key={imageUrl} className="rounded-lg after:rounded-lg">
							<AvatarImage
								src={imageUrl}
								alt={name}
								className="rounded-lg object-contain"
							/>
							<AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
						</Avatar>
					</Link>
					<div className="grid min-w-0 flex-1 gap-0.5 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
						<Link
							to={ROUTES.dashboard.url}
							onClick={handleNavigate}
							title={name}
							className="truncate rounded font-medium focus-visible:outline-ring"
						>
							{name}
						</Link>
						<OrganizationSwitcher organizationName={organizationName} />
					</div>
				</div>
			</SidebarMenuItem>
		</SidebarMenu>
	);
};
