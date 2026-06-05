import { Link, useLocation } from "@tanstack/react-router";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/shared/components/ui";
import type { RouteSection } from "@/shared/config/routes";
import { can, useLoggedUserSessionStore } from "@/shared/session";

interface NavMainProps {
	items: RouteSection[];
}

export function isSidebarRouteActive(pathname: string, url: string) {
	if (url === "/") {
		return pathname === "/";
	}

	return pathname === url || pathname.startsWith(`${url}/`);
}

export const NavMain = ({ items }: NavMainProps) => {
	const location = useLocation();
	const session = useLoggedUserSessionStore((currentSession) => currentSession);

	return items.map((item) => {
		const visibleItems = item.items.filter((subItem) =>
			subItem.permission ? can(session, subItem.permission) : true,
		);

		if (visibleItems.length === 0) {
			return null;
		}

		return (
			<SidebarGroup key={item.title}>
				<SidebarGroupLabel>{item.title}</SidebarGroupLabel>
				<SidebarMenu className="gap-1">
					{visibleItems.map((subItem) => (
						<SidebarMenuItem key={subItem.title}>
							<SidebarMenuButton
								isActive={isSidebarRouteActive(location.pathname, subItem.url)}
								tooltip={subItem.title}
								render={
									<Link to={subItem.url}>
										{subItem.icon && <subItem.icon />}
										<span className="group-data-[collapsible=icon]:hidden">
											{subItem.title}
										</span>
									</Link>
								}
							/>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroup>
		);
	});
};
