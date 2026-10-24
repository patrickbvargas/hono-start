import type { ToPathOption } from "@tanstack/react-router";
import {
	BriefcaseIcon,
	DollarSignIcon,
	LayoutDashboardIcon,
	type LucideIcon,
	ScrollTextIcon,
	UserIcon,
	UsersIcon,
	WalletCardsIcon,
	WalletIcon,
} from "lucide-react";
import type { ClerkPermission } from "@/shared/session";

export interface RouteItem {
	title: string;
	url: ToPathOption;
	icon?: LucideIcon;
	isActive?: boolean;
	permission?: ClerkPermission | readonly ClerkPermission[];
}

export interface RouteSection extends RouteItem {
	items: RouteItem[];
}

export function getPageTitle(title?: string) {
	return title ? `${title} | Hono` : "Hono";
}

type RouteName =
	| "dashboard"
	| "client"
	| "contract"
	| "fee"
	| "expense"
	| "remuneration"
	| "employee"
	| "auditLog";

export const ROUTES: Record<RouteName, RouteItem> = {
	dashboard: {
		title: "Dashboard",
		url: "/",
		icon: LayoutDashboardIcon,
		permission: [
			"org:dashboard:read_all",
			"org:dashboard:read_own",
			"org:expenses:read",
		],
	},
	client: {
		title: "Clientes",
		url: "/clientes",
		icon: UserIcon,
		permission: "org:clients:read",
	},
	contract: {
		title: "Contratos",
		url: "/contratos",
		icon: BriefcaseIcon,
		permission: ["org:contracts:read_all", "org:contracts:read_assigned"],
	},
	fee: {
		title: "Honorários",
		url: "/honorarios",
		icon: DollarSignIcon,
		permission: ["org:fees:read_all", "org:fees:read_assigned"],
	},
	expense: {
		title: "Despesas",
		url: "/despesas",
		icon: WalletCardsIcon,
		permission: "org:expenses:read",
	},
	remuneration: {
		title: "Remunerações",
		url: "/remuneracoes",
		icon: WalletIcon,
		permission: ["org:remunerations:read_all", "org:remunerations:read_own"],
	},
	employee: {
		title: "Colaboradores",
		url: "/colaboradores",
		icon: UsersIcon,
		permission: "org:employees:read",
	},
	auditLog: {
		title: "Auditoria",
		url: "/auditoria",
		icon: ScrollTextIcon,
		permission: "org:audit_logs:read",
	},
} as const;
