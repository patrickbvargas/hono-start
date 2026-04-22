import {
	BadgeCheckIcon,
	BellIcon,
	EllipsisVerticalIcon,
	LogOutIcon,
} from "lucide-react";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/shared/components/ui";

export const NavUser = () => {
	const { isMobile } = useSidebar();
	// const { theme, setTheme } = useTheme();

	const user = {
		name: "Patrick Vargas",
		email: "fj8oT@example.com",
		avatar: "https://github.com/patrickbvargas.png",
	};

	// const getThemeIcon = (themeName: string) => {
	//   switch (themeName) {
	//     case "light":
	//       _getThemeIconcon size={16} />;
	//     case "dark":
	//       return <MoonIcon size={16} />;
	//     case "system":
	//       return <MonitorIcon size={16} />;
	//     default:
	//       return <MonitorIcon size={16} />;
	//   }
	// };

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<SidebarMenuButton size="lg">
								<Avatar>
									<AvatarImage src={user.avatar} alt={user.name} />
									<AvatarFallback>PV</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{user.name}</span>
									<span className="text-muted-foreground truncate text-xs">
										{user.email}
									</span>
								</div>
								<EllipsisVerticalIcon size={16} />
							</SidebarMenuButton>
						}
					/>
					<DropdownMenuContent
						className="min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuGroup>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage src={user.avatar} alt={user.name} />
										<AvatarFallback className="rounded-lg">CN</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-medium">{user.name}</span>
										<span className="text-muted-foreground truncate text-xs">
											{user.email}
										</span>
									</div>
								</div>
							</DropdownMenuLabel>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<BadgeCheckIcon size={16} />
								Conta
							</DropdownMenuItem>
							<DropdownMenuItem>
								<BellIcon size={16} />
								Notificações
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem>
							<LogOutIcon size={16} />
							Sair
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
};
