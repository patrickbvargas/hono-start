import type { ToPathOption } from "@tanstack/react-router";
import {
	BriefcaseIcon,
	DollarSignIcon,
	LayoutDashboardIcon,
	ListTodoIcon,
	type LucideIcon,
	ScrollTextIcon,
	SettingsIcon,
	TrendingUpIcon,
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
	| "operationalOverview"
	| "financialOverview"
	| "person"
	| "client"
	| "contract"
	| "receivable"
	| "payable"
	| "expense"
	| "employee"
	| "auditLog"
	| "pendingWork"
	| "settings";

export const ROUTES: Record<RouteName, RouteItem> = {
	payable: {
		title: "Contas a pagar",
		url: "/contas-a-pagar",
		icon: WalletIcon,
		permission: ["org:payables:read_all", "org:payables:read_own"],
	},
	receivable: {
		title: "Contas a receber",
		url: "/contas-a-receber",
		icon: DollarSignIcon,
		permission: ["org:receivables:read_all", "org:receivables:read_assigned"],
	},
	operationalOverview: {
		title: "Visão operacional",
		url: "/visao-operacional",
		icon: LayoutDashboardIcon,
		permission: [
			"org:operational_overview:read_all",
			"org:operational_overview:read_own",
			"org:dashboard:read_all",
			"org:dashboard:read_own",
		],
	},
	financialOverview: {
		title: "Visão financeira",
		url: "/visao-financeira",
		icon: TrendingUpIcon,
		permission: [
			"org:financial_overview:read_all",
			"org:cash_flow:read_all",
			"org:payables:read_all",
		],
	},
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
		permission: ["org:dashboard:read_all", "org:dashboard:read_own"],
	},
	person: {
		title: "Pessoas",
		url: "/pessoas",
		icon: UsersIcon,
		permission: [
			"org:people:read",
			"org:clients:read",
			"org:suppliers:read",
			"org:employees:read",
		],
	},
	client: {
		title: "Clientes",
		url: "/pessoas",
		icon: UserIcon,
		permission: "org:clients:read",
	},
	contract: {
		title: "Contratos",
		url: "/contratos",
		icon: BriefcaseIcon,
		permission: ["org:contracts:read_all", "org:contracts:read_assigned"],
	},
	expense: {
		title: "Despesas",
		url: "/despesas",
		icon: WalletCardsIcon,
		permission: "org:expenses:read",
	},
	employee: {
		title: "Colaboradores",
		url: "/pessoas",
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
