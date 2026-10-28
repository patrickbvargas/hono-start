import type { ToPathOption } from "@tanstack/react-router";
import {
	BriefcaseIcon,
	DollarSignIcon,
	LayoutDashboardIcon,
	ListTodoIcon,
	type LucideIcon,
	ScrollTextIcon,
	SettingsIcon,
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

declare module "@tanstack/react-router" {
	interface StaticDataRouteOption {
		pageTitle?: string;
	}
}

export function getPageTitle(
	title: string | undefined,
	applicationName: string,
) {
	return title ? `${title} | ${applicationName}` : applicationName;
}

type RouteName =
	| "dashboard"
	| "client"
	| "contract"
	| "fee"
	| "expense"
	| "remuneration"
	| "employee"
	| "auditLog"
	| "pendingWork"
	| "settings";

export const ROUTES: Record<RouteName, RouteItem> = {
	pendingWork: {
		title: "Pendências",
		url: "/pendencias",
		icon: ListTodoIcon,
		permission: ["org:contracts:read_all", "org:contracts:read_assigned"],
	},
	settings: {
		title: "Configurações",
		url: "/configuracoes",
		icon: SettingsIcon,
	},
	dashboard: {
		title: "Visão geral",
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
		title: "Recebimentos",
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
