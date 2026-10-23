import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { expect, it, vi } from "vitest";

it("reuses cached data until mutation invalidation refreshes an active list", async () => {
	const client = new QueryClient();
	let rows = ["existing"];
	const queryFn = vi.fn(async () => [...rows]);
	const options = {
		queryKey: ["client", "list"],
		queryFn,
		staleTime: Infinity,
	};
	const observer = new QueryObserver(client, options);
	const unsubscribe = observer.subscribe(() => {});
	try {
		await client.query(options);
		await client.query(options);
		expect(queryFn).toHaveBeenCalledTimes(1);
		rows = ["existing", "new client"];
		await client.invalidateQueries({ queryKey: ["client"] });
		expect(observer.getCurrentResult().data).toEqual(rows);
		expect(queryFn).toHaveBeenCalledTimes(2);
	} finally {
		unsubscribe();
		client.clear();
	}
});
it("refreshes an invalidated inactive list on the next loader query", async () => {
	const client = new QueryClient();
	const queryFn = vi.fn(async () => "updated");
	const options = {
		queryKey: ["client", "inactive"],
		queryFn,
		staleTime: Infinity,
	};
	client.setQueryData(options.queryKey, "old");
	await client.invalidateQueries({ queryKey: ["client"] });
	expect(await client.query(options)).toBe("updated");
	client.clear();
});
