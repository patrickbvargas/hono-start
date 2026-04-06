import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { PlusIcon } from "lucide-react";
import * as React from "react";
import {
	EmployeeDeleteDialog,
	EmployeeForm,
	EmployeeRestoreDialog,
	EmployeeTable,
	employeeSearchSchema,
	getEmployeesOptions,
} from "@/features/employees";
import type { Employee } from "@/features/employees/schemas/model";
import {
	Button,
	ModalBackdrop,
	ModalBody,
	ModalCloseTrigger,
	ModalContainer,
	ModalDialog,
	ModalHeader,
	ModalHeading,
	ModalRoot,
} from "@/shared/components/ui";
import { Wrapper, WrapperBody } from "@/shared/components/wrapper";
import { ROUTES } from "@/shared/config/routes";

export const Route = createFileRoute("/funcionarios")({
	validateSearch: zodValidator(employeeSearchSchema),
	loaderDeps: ({ search }) => ({ search }),
	loader: ({ context: { queryClient }, deps: { search } }) => {
		queryClient.ensureQueryData(getEmployeesOptions(search));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search = Route.useSearch();
	const { data } = useSuspenseQuery(getEmployeesOptions(search));

	const [isCreateOpen, setIsCreateOpen] = React.useState(false);
	const [editEmployee, setEditEmployee] = React.useState<Employee | null>(null);
	const [deleteEmployee, setDeleteEmployee] = React.useState<Employee | null>(
		null,
	);
	const [restoreEmployee, setRestoreEmployee] = React.useState<Employee | null>(
		null,
	);

	return (
		<Wrapper
			title={ROUTES.employee.title}
			actions={
				// TODO: show only for Admin role
				<Button size="sm" onPress={() => setIsCreateOpen(true)}>
					<PlusIcon size={16} />
					Novo Funcionário
				</Button>
			}
		>
			<WrapperBody>
				<EmployeeTable
					data={data}
					onEdit={setEditEmployee}
					onDelete={setDeleteEmployee}
					onRestore={setRestoreEmployee}
				/>
			</WrapperBody>

			<ModalRoot isOpen={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<ModalBackdrop />
				<ModalContainer>
					<ModalDialog>
						<ModalHeader>
							<ModalHeading>Novo Funcionário</ModalHeading>
							<ModalCloseTrigger />
						</ModalHeader>
						<ModalBody>
							<EmployeeForm
								mode="create"
								onSuccess={() => setIsCreateOpen(false)}
							/>
						</ModalBody>
					</ModalDialog>
				</ModalContainer>
			</ModalRoot>

			<ModalRoot
				isOpen={editEmployee !== null}
				onOpenChange={(open) => {
					if (!open) setEditEmployee(null);
				}}
			>
				<ModalBackdrop />
				<ModalContainer>
					<ModalDialog>
						<ModalHeader>
							<ModalHeading>Editar Funcionário</ModalHeading>
							<ModalCloseTrigger />
						</ModalHeader>
						<ModalBody>
							{editEmployee && (
								<EmployeeForm
									mode="edit"
									initialEmployee={editEmployee}
									onSuccess={() => setEditEmployee(null)}
								/>
							)}
						</ModalBody>
					</ModalDialog>
				</ModalContainer>
			</ModalRoot>

			{deleteEmployee && (
				<EmployeeDeleteDialog
					employee={deleteEmployee}
					onClose={() => setDeleteEmployee(null)}
				/>
			)}

			{restoreEmployee && (
				<EmployeeRestoreDialog
					employee={restoreEmployee}
					onClose={() => setRestoreEmployee(null)}
				/>
			)}
		</Wrapper>
	);
}
