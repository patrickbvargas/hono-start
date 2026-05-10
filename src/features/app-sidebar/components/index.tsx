import {
	DollarSignIcon,
	LayoutDashboardIcon,
	ScrollTextIcon,
} from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
} from "@/shared/components/ui";
import { ROUTES, type RouteSection } from "@/shared/config/routes";
import { NavHeader } from "./nav-header";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const items: RouteSection[] = [
	{
		title: "Geral",
		url: "#",
		icon: LayoutDashboardIcon,
		isActive: true,
		items: [ROUTES.dashboard, ROUTES.client, ROUTES.contract, ROUTES.employee],
	},
	{
		title: "Financeiro",
		url: "#",
		isActive: true,
		icon: DollarSignIcon,
		items: [ROUTES.fee, ROUTES.remuneration],
	},
	{
		title: "Outro",
		url: "#",
		isActive: true,
		icon: ScrollTextIcon,
		items: [ROUTES.auditLog],
	},
] as const;

export const AppSidebar = ({
	...props
}: React.ComponentProps<typeof Sidebar>) => {
	return (
		<Sidebar variant="inset" {...props}>
			<SidebarHeader>
				<NavHeader />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={items} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
};
