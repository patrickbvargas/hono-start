import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { Pagination } from "@/shared/components/pagination";
import {
	Wrapper,
	WrapperBody,
	WrapperFooter,
	WrapperHeader,
} from "@/shared/components/wrapper";
import { useSort } from "@/shared/hooks/use-sort";
import { paginationSchema } from "@/shared/schemas/pagination";

export const Route = createFileRoute("/")({
	validateSearch: (prev) => paginationSchema.parse(prev),
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ deps: { search } }) => {
		await new Promise((resolve) => setTimeout(resolve, 2000));
		console.log(`fetched data with search: ${JSON.stringify(search)}`);
		return { search };
	},
	component: App,
});

function App() {
	const search = Route.useLoaderData();
	const { isLoading } = useRouterState();
	const { getSortSearch } = useSort();

	return (
		<Wrapper title="Dashboard">
			<WrapperHeader className="bg-neutral-900 rounded-md p-2">
				{isLoading ? "Loading..." : "Dashboard"}
				<div className="p-2 flex gap-2 [&>a]:p-2 [&>a]:border">
					<Link to="/" search={getSortSearch("name")}>
						Name
					</Link>
					<Link to="/" search={getSortSearch("age")}>
						Age
					</Link>
					<Link to="/" search={getSortSearch("count")}>
						Count
					</Link>
				</div>
			</WrapperHeader>
			<WrapperBody>
				<pre>{JSON.stringify(search, null, 2)}</pre>
			</WrapperBody>
			<WrapperFooter>
				<Pagination totalRecords={1000} />
			</WrapperFooter>
		</Wrapper>
	);
}
