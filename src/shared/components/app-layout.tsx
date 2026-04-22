import { MenuIcon, PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/Hui/button";
import { Drawer } from "@/shared/components/Hui/drawer";
import { SidebarNav } from "@/shared/components/Hui/sidebar-nav";

interface AppLayoutProps {
	children: React.ReactNode;
}

// TODO: remover
export const AppLayout = ({ children }: AppLayoutProps) => {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	return (
		<div className="container max-h-screen mx-auto flex min-h-screen border">
			{/* Desktop sidebar */}
			<aside
				className={`hidden md:flex flex-col border-r border-border transition-all duration-200 ${
					isCollapsed ? "w-fit" : "w-56"
				}`}
			>
				<div className="flex items-center justify-end p-2">
					<Button
						variant="ghost"
						size="sm"
						aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
						onPress={() => setIsCollapsed((c) => !c)}
					>
						{isCollapsed ? (
							<PanelLeftOpenIcon size={16} />
						) : (
							<PanelLeftCloseIcon size={16} />
						)}
					</Button>
				</div>
				<SidebarNav isCollapsed={isCollapsed} />
			</aside>

			{/* Mobile layout */}
			<div className="flex flex-1 flex-col">
				{/* Mobile top bar */}
				<header className="flex items-center gap-2 border-b border-border px-4 py-2 md:hidden">
					<Button
						variant="ghost"
						size="sm"
						aria-label="Abrir menu"
						onPress={() => setIsDrawerOpen(true)}
					>
						<MenuIcon className="size-5" />
					</Button>
				</header>

				{/* Main content */}
				<main className="flex-1 h-full overflow-hidden pb-4">{children}</main>
			</div>

			{/* Mobile Drawer */}
			<Drawer.Backdrop isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
				<Drawer.Content placement="left">
					<Drawer.Dialog>
						<Drawer.CloseTrigger />
						<Drawer.Header>
							<Drawer.Heading>Menu</Drawer.Heading>
						</Drawer.Header>
						<Drawer.Body className="p-0">
							<SidebarNav onNavigate={() => setIsDrawerOpen(false)} />
						</Drawer.Body>
					</Drawer.Dialog>
				</Drawer.Content>
			</Drawer.Backdrop>
		</div>
	);
};
