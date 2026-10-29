import { useClerk } from "@clerk/tanstack-react-start";
export function useUserProfile() {
	const { openUserProfile } = useClerk();
	return { handleOpenUserProfile: () => openUserProfile() };
}
