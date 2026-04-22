import { useRouterState } from "@tanstack/react-router";
import type { RouteItem } from "@/shared/config/routes";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/utils";
import { Link } from "./link";
import { ListBox } from "./list-box";

export interface SidebarNavProps {
	isCollapsed?: boolean;
	onNavigate?: () => void;
}

const routeEntries = Object.values(ROUTES) as RouteItem[];

export const SidebarNav = ({
	isCollapsed = false,
	onNavigate,
}: SidebarNavProps) => {
	const router = useRouterState();
	const pathname = router.location.pathname;

	const activeKey = routeEntries.find((r) => r.url === pathname)?.url ?? "";

	return (
		<ListBox
			aria-label="Navegação principal"
			selectionMode="single"
			selectedKeys={new Set([activeKey])}
			className="w-full gap-1 p-2"
		>
			{routeEntries.map((route) => {
				const Icon = route.icon;
				return (
					<ListBox.Item
						key={route.url as string}
						id={route.url as string}
						textValue={route.title}
						className="data-selected:bg-accent-soft"
					>
						<Link
							to={route.url}
							onClick={onNavigate}
							className={cn(
								"w-full min-w-5 flex items-center gap-2 no-underline pl-0.5",
								isCollapsed && "gap-0 pl-0 justify-center",
							)}
						>
							{Icon && <Icon size={16} className="shrink-0" />}
							<span className={isCollapsed ? "sr-only" : undefined}>
								{route.title}
							</span>
						</Link>
					</ListBox.Item>
				);
			})}
		</ListBox>
	);
};
