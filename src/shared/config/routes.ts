import type { ToPathOption } from "@tanstack/react-router";
import {
	BriefcaseIcon,
	DollarSignIcon,
	LayoutDashboardIcon,
	type LucideIcon,
	ScrollTextIcon,
	UserIcon,
	UsersIcon,
	WalletIcon,
} from "lucide-react";

export interface RouteItem {
	title: string;
	url: ToPathOption;
	icon?: LucideIcon;
	isActive?: boolean;
}

export interface RouteSection extends RouteItem {
	items: RouteItem[];
}

type RouteName =
	| "dashboard"
	| "client"
	| "contract"
	| "fee"
	| "remuneration"
	| "employee"
	| "auditLog";

export const ROUTES: Record<RouteName, RouteItem> = {
	dashboard: {
		title: "Dashboard",
		url: "/",
		icon: LayoutDashboardIcon,
	},
	client: {
		title: "Clientes",
		url: "/clientes",
		icon: UserIcon,
	},
	contract: {
		title: "Contratos",
		url: "/contratos",
		icon: BriefcaseIcon,
	},
	fee: {
		title: "Honorários",
		url: "/honorarios",
		icon: DollarSignIcon,
	},
	remuneration: {
		title: "Remunerações",
		url: "/remuneracoes",
		icon: WalletIcon,
	},
	employee: {
		title: "Colaboradores",
		url: "/colaboradores",
		icon: UsersIcon,
	},
	auditLog: {
		title: "Auditoria",
		url: "/audit-log",
		icon: ScrollTextIcon,
	},
} as const;
