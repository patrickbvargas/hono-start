import { Drawer } from "@/shared/components/ui";
import type { OverlayState } from "@/shared/types/overlay";
import type { Employee } from "../../schemas/model";

interface EmployeeDetailsProps {
	employee: Employee;
	state: OverlayState;
	onSuccess?: () => void;
}

export const EmployeeDetails = ({ employee, state }: EmployeeDetailsProps) => {
	return (
		<Drawer>
			<Drawer.Backdrop isOpen={state.isOpen} onOpenChange={state.onOpenChange}>
				<Drawer.Content placement="right">
					<Drawer.Dialog>
						{/*<Drawer.Handle />*/}
						<Drawer.CloseTrigger />
						<Drawer.Header>
							<Drawer.Heading>{employee.fullName}</Drawer.Heading>
						</Drawer.Header>
						<Drawer.Body>
							<p>dsadsas</p>
							{/*<pre>{JSON.stringify(employee, null, 2)}</pre>*/}
						</Drawer.Body>
						<Drawer.Footer />
					</Drawer.Dialog>
				</Drawer.Content>
			</Drawer.Backdrop>
		</Drawer>
	);
};
