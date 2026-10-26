import {
	ClientDelete,
	ClientDetails,
	ClientForm,
	ClientRestore,
} from "@/features/clients";
import {
	ContractDelete,
	ContractDetails,
	ContractForm,
	ContractRestore,
} from "@/features/contracts";
import {
	EmployeeDelete,
	EmployeeDetails,
	EmployeeForm,
	EmployeeRestore,
} from "@/features/employees";
import {
	ExpenseDelete,
	ExpenseDetails,
	ExpenseForm,
	ExpenseRestore,
} from "@/features/expenses";
import { FeeDelete, FeeDetails, FeeForm, FeeRestore } from "@/features/fees";
import {
	RemunerationDelete,
	RemunerationDetails,
	RemunerationForm,
	RemunerationRestore,
} from "@/features/remunerations";
import { useOverlay } from "@/shared/hooks/use-overlay";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import type { OverlayState } from "@/shared/types/overlay";
import type { RelatedRecordKind } from "../../schemas/record";

const components = {
	expense: {
		Details: ExpenseDetails,
		Form: ExpenseForm,
		Delete: ExpenseDelete,
		Restore: ExpenseRestore,
		deletePermission: "org:expenses:delete",
		restorePermission: "org:expenses:restore",
	},
	remuneration: {
		Details: RemunerationDetails,
		Form: RemunerationForm,
		Delete: RemunerationDelete,
		Restore: RemunerationRestore,
		deletePermission: "org:remunerations:delete",
		restorePermission: "org:remunerations:restore",
	},
	client: {
		Details: ClientDetails,
		Form: ClientForm,
		Delete: ClientDelete,
		Restore: ClientRestore,
		deletePermission: "org:clients:delete",
		restorePermission: "org:clients:restore",
	},
	employee: {
		Details: EmployeeDetails,
		Form: EmployeeForm,
		Delete: EmployeeDelete,
		Restore: EmployeeRestore,
		deletePermission: "org:employees:delete",
		restorePermission: "org:employees:restore",
	},
	contract: {
		Details: ContractDetails,
		Form: ContractForm,
		Delete: ContractDelete,
		Restore: ContractRestore,
		deletePermission: "org:contracts:delete",
		restorePermission: "org:contracts:restore",
	},
	fee: {
		Details: FeeDetails,
		Form: FeeForm,
		Delete: FeeDelete,
		Restore: FeeRestore,
		deletePermission: "org:fees:delete",
		restorePermission: "org:fees:restore",
	},
} as const;

interface RelatedRecordDetailsProps {
	kind: RelatedRecordKind;
	id: EntityId;
	state: OverlayState;
}

export function RelatedRecordDetails({
	kind,
	id,
	state,
}: RelatedRecordDetailsProps) {
	const { overlay } = useOverlay<EntityId>();
	const session = useLoggedUserSession();
	const {
		Details,
		Form,
		Delete,
		Restore,
		deletePermission,
		restorePermission,
	} = components[kind];
	return (
		<>
			<Details
				id={id}
				state={state}
				canManageLifecycle={
					hasPermission(session, deletePermission) ||
					hasPermission(session, restorePermission)
				}
				onEdit={overlay.edit.open}
				onDelete={overlay.delete.open}
				onRestore={overlay.restore.open}
			/>
			{overlay.edit.render((selectedId, editState) => (
				<Form id={selectedId} state={editState} onSuccess={editState.close} />
			))}
			{overlay.delete.render((selectedId, deleteState) => (
				<Delete
					id={selectedId}
					state={deleteState}
					onSuccess={() => {
						deleteState.close();
						state.close();
					}}
				/>
			))}
			{overlay.restore.render((selectedId, restoreState) => (
				<Restore
					id={selectedId}
					state={restoreState}
					onSuccess={restoreState.close}
				/>
			))}
		</>
	);
}
