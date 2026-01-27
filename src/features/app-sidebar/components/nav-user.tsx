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
} from "@/shared/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/shared/components/ui/sidebar";

export function NavUser() {
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
					<DropdownMenuTrigger asChild>
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
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
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
						{/* <DropdownMenuSeparator /> 
             <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex gap-2">
                {getThemeIcon(theme || "system")}
                Tema
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <SunIcon size={16} />
                  Claro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <MoonIcon size={16} />
                  Escuro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <MonitorIcon size={16} />
                  Sistema
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub> */}
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
}
