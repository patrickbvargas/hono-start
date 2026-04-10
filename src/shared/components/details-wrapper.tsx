import { Button, Drawer, type DrawerProps } from "@/shared/components/ui";
import type { OverlayState } from "@/shared/types/overlay";

interface FormWrapperProps extends Omit<DrawerProps, "state"> {
	title: string;
	state: OverlayState;
}

export const DetailsWrapper = ({
	title,
	state,
	children,
	...props
}: FormWrapperProps) => {
	return (
		<Drawer {...props}>
			<Drawer.Backdrop isOpen={state.isOpen} onOpenChange={state.onOpenChange}>
				<Drawer.Content placement="right">
					<Drawer.Dialog>
						<Drawer.CloseTrigger />
						<Drawer.Header>
							<Drawer.Heading>{title}</Drawer.Heading>
						</Drawer.Header>
						<Drawer.Body>{children}</Drawer.Body>
						<Drawer.Footer>
							<Button slot="close" variant="outline" className="w-full">
								Fechar
							</Button>
						</Drawer.Footer>
					</Drawer.Dialog>
				</Drawer.Content>
			</Drawer.Backdrop>
		</Drawer>
	);
};
