import { Modal, type ModalProps } from "@/shared/components/ui";
import type { OverlayState } from "@/shared/types/overlay";

interface FormWrapperProps extends Omit<ModalProps, "state"> {
	title: string;
	state: OverlayState;
	footer?: React.ReactNode;
}

export const FormWrapper = ({
	title,
	state,
	footer,
	children,
	...props
}: FormWrapperProps) => {
	return (
		<Modal {...props}>
			<Modal.Backdrop isOpen={state.isOpen} onOpenChange={state.onOpenChange}>
				<Modal.Container size="lg">
					<Modal.Dialog>
						<Modal.CloseTrigger />
						<Modal.Header>
							<Modal.Heading>{title}</Modal.Heading>
						</Modal.Header>
						<Modal.Body className="flex flex-col gap-2.5 overflow-hidden">
							{children}
						</Modal.Body>
						{footer && <Modal.Footer>{footer}</Modal.Footer>}
					</Modal.Dialog>
				</Modal.Container>
			</Modal.Backdrop>
		</Modal>
	);
};
