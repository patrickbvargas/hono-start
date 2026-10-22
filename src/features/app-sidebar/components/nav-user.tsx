import { useUser } from "@clerk/tanstack-react-start";
import {
	CircleUserIcon,
	EllipsisVerticalIcon,
	LogOutIcon,
	MonitorCogIcon,
	MoonIcon,
	SunIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { UserProfileDialog, useLogout } from "@/features/authentication";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	Spinner,
	useSidebar,
} from "@/shared/components/ui";
import { useLoggedUserSession } from "@/shared/session";

export const NavUser = () => {
	const { isMobile } = useSidebar();
	const session = useLoggedUserSession();
	const { user } = useUser();
	const fullName = user?.fullName || user?.username || session.user.fullName;
	const email = user?.primaryEmailAddress?.emailAddress ?? session.user.email;
	const { handleLogout, isPending } = useLogout();
	const { theme, setTheme } = useTheme();
	const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
	const userInitials = fullName
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<UserProfileDialog
					open={isUserProfileOpen}
					onOpenChange={setIsUserProfileOpen}
				/>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<SidebarMenuButton size="lg">
								<Avatar>
									<AvatarImage src={user?.imageUrl} alt={fullName} />
									<AvatarFallback>{userInitials}</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
									<span className="truncate font-medium">{fullName}</span>
									<span className="text-muted-foreground truncate text-xs">
										{email}
									</span>
								</div>
								<EllipsisVerticalIcon
									size={16}
									className="group-data-[collapsible=icon]:hidden"
								/>
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
									<Avatar className="size-8">
										<AvatarImage src={user?.imageUrl} alt={fullName} />
										<AvatarFallback>{userInitials}</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-medium">{fullName}</span>
										<span className="text-muted-foreground truncate text-xs">
											{email}
										</span>
									</div>
								</div>
							</DropdownMenuLabel>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								onClick={() => {
									setIsUserProfileOpen(true);
								}}
							>
								<CircleUserIcon size={16} />
								Conta
							</DropdownMenuItem>
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>
									<MonitorCogIcon size={16} />
									Tema
								</DropdownMenuSubTrigger>
								<DropdownMenuSubContent>
									<DropdownMenuRadioGroup
										value={theme ?? "system"}
										onValueChange={setTheme}
									>
										<DropdownMenuRadioItem value="system">
											<MonitorCogIcon size={16} />
											Sistema
										</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="light">
											<SunIcon size={16} />
											Claro
										</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="dark">
											<MoonIcon size={16} />
											Escuro
										</DropdownMenuRadioItem>
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleLogout} disabled={isPending}>
							{isPending ? (
								<Spinner className="size-4" aria-hidden="true" />
							) : (
								<LogOutIcon size={16} />
							)}
							Sair
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
};
