import { createFileRoute } from "@tanstack/react-router";
import { DemoForm } from "@/shared/components/form/demo";
import { Pagination } from "@/shared/components/pagination";
import { RouteError } from "@/shared/components/route-error";
import { RouteLoading } from "@/shared/components/route-loading";
import { Wrapper } from "@/shared/components/wrapper";

export const Route = createFileRoute("/")({
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ deps: { search } }) => ({ search }),
	pendingComponent: () => <RouteLoading />,
	errorComponent: ({ error }) => <RouteError error={error} />,
	component: App,
});

// TODO: demo feature - remove from production
function App() {
	return (
		<Wrapper title="Dashboard">
			<Wrapper.Body>
				<DemoForm />
			</Wrapper.Body>
			<Wrapper.Footer>
				<Pagination totalRecords={1000} />
			</Wrapper.Footer>
		</Wrapper>
	);
}
