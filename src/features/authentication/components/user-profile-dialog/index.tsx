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
			<DialogContent className="min-w-fit p-0">
				<UserProfile routing="hash" />
			</DialogContent>
		</Dialog>
	);
}
