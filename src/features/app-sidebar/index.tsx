import { LayoutDashboardIcon, LifeBuoyIcon, PiggyBankIcon } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
} from "@/shared/components/ui/sidebar";
import { ROUTES, type RouteSection } from "@/shared/config/routes";
import { NavHeader } from "./components/nav-header";
import { NavMain } from "./components/nav-main";
import { NavUser } from "./components/nav-user";

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
		icon: PiggyBankIcon,
		items: [ROUTES.fee, ROUTES.remuneration],
	},
	{
		title: "Ajuda",
		url: "#",
		isActive: true,
		icon: LifeBuoyIcon,
		items: [ROUTES.setting, ROUTES.support],
	},
] as const;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
}
