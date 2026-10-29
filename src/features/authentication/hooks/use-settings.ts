import { useTheme } from "next-themes";
import { useUserProfile } from "./use-user-profile";
export function useSettings() {
	const { handleOpenUserProfile } = useUserProfile();
	const { theme, setTheme } = useTheme();
	return { handleOpenUserProfile, theme, setTheme };
}
