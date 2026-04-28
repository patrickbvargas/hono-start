import {
	BadgeCheckIcon,
	BellIcon,
	EllipsisVerticalIcon,
	LogOutIcon,
} from "lucide-react";
import { useLogout } from "@/features/authentication";
import {
	Avatar,
	AvatarFallback,
	Badge,
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
import { useLoggedUserSession } from "@/shared/session";

export const NavUser = () => {
	const { isMobile } = useSidebar();
	const session = useLoggedUserSession();
	const { handleLogout, isPending } = useLogout();
	const userInitials = session.user.fullName
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<SidebarMenuButton size="lg">
								<Avatar>
									<AvatarFallback>{userInitials}</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										{session.user.fullName}
									</span>
									<span className="text-muted-foreground truncate text-xs">
										{session.user.email}
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
										<AvatarFallback className="rounded-lg">
											{userInitials}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-medium">
											{session.user.fullName}
										</span>
										<span className="text-muted-foreground truncate text-xs">
											{session.user.email}
										</span>
										<div className="mt-1">
											<Badge variant="secondary" className="text-[10px]">
												{session.role.label}
											</Badge>
										</div>
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
						<DropdownMenuItem onClick={handleLogout} disabled={isPending}>
							<LogOutIcon size={16} />
							Sair
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
};
