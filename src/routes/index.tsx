import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { Pagination } from "@/shared/components/pagination";
import {
	Wrapper,
	WrapperBody,
	WrapperFooter,
} from "@/shared/components/wrapper";

type Person = {
	firstName: string;
	lastName: string;
	age: number;
	visits: number;
	status: string;
	progress: number;
};

const mockData: Person[] = [
	{
		firstName: "tanner",
		lastName: "linsley",
		age: 24,
		visits: 100,
		status: "In Relationship",
		progress: 50,
	},
	{
		firstName: "tandy",
		lastName: "miller",
		age: 40,
		visits: 40,
		status: "Single",
		progress: 80,
	},
	{
		firstName: "joe",
		lastName: "dirte",
		age: 45,
		visits: 20,
		status: "Complicated",
		progress: 10,
	},
	{
		firstName: "alice",
		lastName: "johnson",
		age: 28,
		visits: 55,
		status: "Single",
		progress: 90,
	},
	{
		firstName: "bob",
		lastName: "smith",
		age: 32,
		visits: 12,
		status: "In Relationship",
		progress: 30,
	},
	{
		firstName: "charlie",
		lastName: "brown",
		age: 19,
		visits: 88,
		status: "Single",
		progress: 65,
	},
	{
		firstName: "david",
		lastName: "wilson",
		age: 50,
		visits: 5,
		status: "Complicated",
		progress: 5,
	},
	{
		firstName: "eva",
		lastName: "davis",
		age: 22,
		visits: 150,
		status: "In Relationship",
		progress: 100,
	},
];

export const Route = createFileRoute("/")({
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ deps: { search } }) => ({ search }),
	component: App,
});

function App() {
	const search = Route.useLoaderData();

	const columns = React.useMemo(() => {
		const c = createColumnHelper<Person>();

		return [
			c.accessor("firstName", {}),
			c.accessor("lastName", {}),
			c.accessor("age", {}),
			c.accessor("visits", {}),
			c.accessor("status", {
				enableSorting: false,
			}),
			c.accessor("progress", {
				enableSorting: false,
			}),
		];
	}, []);

	return (
		<Wrapper title="Dashboard">
			<WrapperBody>
				<pre>{JSON.stringify(search, null, 2)}</pre>
				<DataTable columns={columns} data={mockData} />
			</WrapperBody>
			<WrapperFooter>
				<Pagination totalRecords={1000} />
			</WrapperFooter>
		</Wrapper>
	);
}
