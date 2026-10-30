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
		title: "Trabalho",
		url: "#",
		icon: LayoutDashboardIcon,
		isActive: true,
		items: [ROUTES.dashboard, ROUTES.contract, ROUTES.pendingWork],
	},
	{
		title: "Financeiro",
		url: "#",
		isActive: true,
		icon: DollarSignIcon,
		items: [ROUTES.fee, ROUTES.remuneration, ROUTES.expense],
	},
	{ title: "Cadastros", url: "#", items: [ROUTES.person] },
	{
		title: "Administração",
		url: "#",
		isActive: true,
		icon: ScrollTextIcon,
		items: [ROUTES.settings],
	},
] as const;

export const AppSidebar = ({
	...props
}: React.ComponentProps<typeof Sidebar>) => {
	return (
		<Sidebar variant="inset" collapsible="icon" {...props}>
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
