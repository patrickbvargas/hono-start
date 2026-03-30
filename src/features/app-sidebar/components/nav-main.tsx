import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/shared/components/ui/sidebar";
import type { RouteSection } from "@/shared/config/routes";

interface NavMainProps {
	items: RouteSection[];
}

export const NavMain = ({ items }: NavMainProps) => {
	const location = useLocation();

	const isActive = (url: string) => location.pathname.startsWith(url);

	return (
		<SidebarGroup>
			<SidebarMenu>
				{items.map((item) => (
					<Collapsible key={item.title} defaultOpen={item.isActive}>
						<SidebarMenuItem key={item.title}>
							<CollapsibleTrigger
								className="group/collapsible-trigger"
								render={
									<SidebarMenuButton tooltip={item.title}>
										{item.icon && <item.icon />}
										<span>{item.title}</span>
										<ChevronRight className="ml-auto transition-transform duration-200 group-aria-expanded/collapsible-trigger:rotate-90" />
									</SidebarMenuButton>
								}
							/>
							<CollapsibleContent>
								<SidebarMenuSub>
									{item.items.map((subItem) => (
										<SidebarMenuSubItem key={subItem.title}>
											<SidebarMenuSubButton
												isActive={isActive(subItem.url)}
												render={
													<Link to={subItem.url}>
														<span>{subItem.title}</span>
													</Link>
												}
											/>
										</SidebarMenuSubItem>
									))}
								</SidebarMenuSub>
							</CollapsibleContent>
						</SidebarMenuItem>
					</Collapsible>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
};
