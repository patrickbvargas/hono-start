import { useTheme } from "next-themes";
import { useState } from "react";
export function useSettings() {
	const [accountOpen, setAccountOpen] = useState(false);
	const { theme, setTheme } = useTheme();
	return { accountOpen, setAccountOpen, theme, setTheme };
}
