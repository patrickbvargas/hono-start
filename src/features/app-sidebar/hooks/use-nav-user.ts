import { useUser } from "@clerk/tanstack-react-start";
import { useTheme } from "next-themes";
import { useLogout, useUserProfile } from "@/features/authentication";
import { useSidebar } from "@/shared/components/ui";
import { useLoggedUserSession } from "@/shared/session";

export function useNavUser() {
	const { isMobile } = useSidebar();
	const session = useLoggedUserSession();
	const { user } = useUser();
	const fullName = user?.fullName || user?.username || session.user.fullName;
	const email = user?.primaryEmailAddress?.emailAddress ?? session.user.email;
	const { handleLogout, isPending } = useLogout();
	const { theme, setTheme } = useTheme();
	const { handleOpenUserProfile } = useUserProfile();
	const userInitials = fullName
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");

	return {
		isMobile,
		fullName,
		email,
		imageUrl: user?.imageUrl,
		handleLogout,
		isPending,
		theme,
		setTheme,
		handleOpenUserProfile,
		userInitials,
	};
}
