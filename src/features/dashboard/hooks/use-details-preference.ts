import { useEffect, useState } from "react";

const STORAGE_KEY = "dashboard.showDetailedAnalyses";

export function useDashboardDetailsPreference() {
	const [showDetails, setShowDetails] = useState(false);

	useEffect(() => {
		try {
			setShowDetails(window.localStorage.getItem(STORAGE_KEY) === "true");
		} catch {
			// Keep the default when browser storage is unavailable.
		}
	}, []);

	const handleShowDetailsChange = (checked: boolean) => {
		setShowDetails(checked);
		try {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
		} catch {
			// Keep the control usable when browser storage is unavailable.
		}
	};

	return { showDetails, handleShowDetailsChange };
}
