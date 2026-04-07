import { Drawer } from "@/shared/components/ui";
import type { OverlayState } from "@/shared/types/overlay";
import type { Employee } from "../../schemas/model";

interface EmployeeDetailsProps {
	employee: Employee;
	state: OverlayState;
	onSuccess?: () => void;
}

export const EmployeeDetails = ({
	employee,
	state,
	onSuccess,
}: EmployeeDetailsProps) => {
	return (
		<Drawer state={state}>
			<Drawer.Backdrop>
				<Drawer.Content placement="right">
					<Drawer.Dialog>
						{/*<Drawer.Handle /> {/* Optional: Drag handle */}
						<Drawer.CloseTrigger /> {/* Optional: Close button */}
						<Drawer.Header>
							{/*<Drawer.Heading>{employee.fullName}</Drawer.Heading>*/}
							<Drawer.Heading>Titulo</Drawer.Heading>
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
