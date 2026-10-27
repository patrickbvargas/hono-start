import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "@/features/authentication";
import { ScrollArea } from "@/shared/components/ui";
import { Wrapper, WrapperBody } from "@/shared/components/wrapper";
import { getPageTitle } from "@/shared/config/routes";
export const Route = createFileRoute("/_app/configuracoes")({
	head: () => ({ meta: [{ title: getPageTitle("Configurações") }] }),
	component: SettingsPage,
});
function SettingsPage() {
	return (
		<Wrapper title="Configurações">
			<WrapperBody>
				<ScrollArea className="min-h-0 flex-1">
					<Settings />
				</ScrollArea>
			</WrapperBody>
		</Wrapper>
	);
}
