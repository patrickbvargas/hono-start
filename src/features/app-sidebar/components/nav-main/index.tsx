import { Link, useLocation } from "@tanstack/react-router";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/shared/components/ui";
import type { RouteSection } from "@/shared/config/routes";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { isSidebarRouteActive } from "../../utils/route-match";

interface NavMainProps {
	items: RouteSection[];
}

export const NavMain = ({ items }: NavMainProps) => {
	const location = useLocation();
	const { setOpenMobile } = useSidebar();
	const session = useLoggedUserSession();

	return items.map((item) => {
		const visibleItems = item.items.filter((subItem) =>
			subItem.permission
				? typeof subItem.permission === "string"
					? hasPermission(session, subItem.permission)
					: subItem.permission.some((key) => hasPermission(session, key))
				: true,
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
									<Link to={subItem.url} onClick={() => setOpenMobile(false)}>
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
