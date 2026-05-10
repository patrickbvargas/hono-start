import { Link, useLocation } from "@tanstack/react-router";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/shared/components/ui";
import type { RouteSection } from "@/shared/config/routes";

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

	return items.map((item) => (
		<SidebarGroup
			key={item.title}
			className="group-data-[collapsible=icon]:hidden"
		>
			<SidebarGroupLabel>{item.title}</SidebarGroupLabel>
			<SidebarMenu className="gap-1">
				{item.items.map((subItem) => (
					<SidebarMenuItem key={subItem.title}>
						<SidebarMenuButton
							isActive={isSidebarRouteActive(location.pathname, subItem.url)}
							render={
								<Link to={subItem.url}>
									{subItem.icon && <subItem.icon />}
									<span>{subItem.title}</span>
								</Link>
							}
						/>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	));
};
