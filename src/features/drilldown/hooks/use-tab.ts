import * as z from "zod";
import { useLocalStorage } from "@/shared/hooks/use-local-storage";

const drilldownTabSchema = z.enum(["summary", "data"]);

export function useDrilldownTab() {
	const [tab, setTab] = useLocalStorage("drilldown.tab", "summary", {
		schema: drilldownTabSchema,
	});
	const handleTabChange = (value: unknown) => {
		const parsed = drilldownTabSchema.safeParse(value);
		if (parsed.success) {
			setTab(parsed.data);
		}
	};
	return { tab, handleTabChange };
}
