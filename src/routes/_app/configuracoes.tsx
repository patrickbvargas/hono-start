import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "@/features/authentication";
import { Wrapper, WrapperBody } from "@/shared/components/wrapper";
import { getPageTitle } from "@/shared/config/routes";
export const Route = createFileRoute("/_app/configuracoes")({
	head: () => ({ meta: [{ title: getPageTitle("Configurações") }] }),
	component: SettingsPage,
});
function SettingsPage() {
	return (
		<Wrapper title="Configurações">
			<WrapperBody className="overflow-y-auto">
				<Settings />
			</WrapperBody>
		</Wrapper>
	);
}
