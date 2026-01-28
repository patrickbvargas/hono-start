import type { ToPathOption } from "@tanstack/react-router";
import {
	BriefcaseIcon,
	DollarSignIcon,
	LayoutDashboardIcon,
	LifeBuoyIcon,
	type LucideIcon,
	Settings2Icon,
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
	| "setting"
	| "support";

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
		title: "Funcionários",
		url: "/funcionarios",
		icon: UsersIcon,
	},
	setting: {
		title: "Configurações",
		url: "/configuracoes",
		icon: Settings2Icon,
	},
	support: {
		title: "Suporte",
		url: "/suporte",
		icon: LifeBuoyIcon,
	},
} as const;
