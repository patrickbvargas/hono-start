import { Button, AlertDialog } from "@/shared/components/ui";
import { CheckIcon, XIcon } from "lucide-react";
import { OverlayState } from "@/shared/types/overlay";

export interface DialogConfirmProps {
  onConfirm: () => void;
  state: OverlayState;
  title?: string;
  description: string;
  hideTitle?: boolean;
  hideIcons?: boolean;
  isCompact?: boolean;
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
}

export const DialogConfirm = ({
  onConfirm,
  state,
  description,
  title = "Confirmação",
  confirmButtonLabel = "Sim",
  cancelButtonLabel = "Não",
  hideIcons = false,
}: DialogConfirmProps) => {
  return (
    <AlertDialog isOpen={state.isOpen} onOpenChange={state.setOpen}>
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>{title}</AlertDialog.Header>
            <AlertDialog.Body>
              <p>{description}</p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button variant="primary" onPress={onConfirm}>
                {!hideIcons && <CheckIcon size={20} />}
                {confirmButtonLabel}
              </Button>
              <Button variant="secondary" onPress={state.close}>
                {!hideIcons && <XIcon size={20} />}
                {cancelButtonLabel}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
};
