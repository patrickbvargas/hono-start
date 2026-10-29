import { UserProfile } from "@clerk/tanstack-react-start";
import { Dialog, DialogContent } from "@/shared/components/ui";

interface UserProfileDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}
export function UserProfileDialog({
	open,
	onOpenChange,
}: UserProfileDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="min-w-fit p-0 max-md:flex max-md:h-dvh max-md:max-h-dvh max-md:min-w-0 max-md:max-w-full max-md:overflow-hidden max-md:rounded-none max-md:[&_.cl-rootBox]:h-full max-md:[&_.cl-rootBox]:w-full! max-md:[&_.cl-rootBox]:max-w-none! max-md:[&_.cl-cardBox]:h-full! max-md:[&_.cl-cardBox]:max-h-none! max-md:[&_.cl-cardBox]:w-full! max-md:[&_.cl-cardBox]:max-w-none! max-md:[&_.cl-cardBox]:rounded-none! max-md:[&_.cl-card]:min-h-0 max-md:[&_.cl-card]:flex-1 max-md:[&_.cl-card]:rounded-none!">
				<UserProfile routing="hash" />
			</DialogContent>
		</Dialog>
	);
}
