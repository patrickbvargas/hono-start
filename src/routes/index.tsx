import { createFileRoute } from "@tanstack/react-router";
import {
	Wrapper,
	WrapperBody,
	WrapperFooter,
	WrapperHeader,
} from "@/shared/components/wrapper";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<Wrapper title="Dashboard">
			<WrapperHeader className="bg-neutral-900 rounded-md p-2">
				Header
			</WrapperHeader>
			<WrapperBody>
				<div className="bg-neutral-900 rounded-md p-2 h-dvh">Body</div>
			</WrapperBody>
			<WrapperFooter className="bg-neutral-900 rounded-md p-2">
				Footer
			</WrapperFooter>
		</Wrapper>
	);
}
