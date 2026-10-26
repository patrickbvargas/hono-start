import * as z from "zod";
import { useLocalStorage } from "@/shared/hooks/use-local-storage";

const STORAGE_KEY = "dashboard.showDetailedAnalyses";
const preferenceSchema = z.boolean();

export function useDashboardDetailsPreference() {
	const [showDetails, handleShowDetailsChange] = useLocalStorage(
		STORAGE_KEY,
		false,
		{ schema: preferenceSchema },
	);

	return { showDetails, handleShowDetailsChange };
}
