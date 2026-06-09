import * as React from "react";
import { AttachmentSection } from "@/features/attachments";
import { EntityActions } from "@/shared/components/entity-actions";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useExpense } from "../../hooks/use-data";
import { getExpenseLifecycleActions } from "../../utils/lifecycle-actions";

interface ExpenseDetailsProps {
	canManageLifecycle?: boolean;
	id: EntityId;
	onDelete?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
	state: OverlayState;
}

export const ExpenseDetails = ({
	canManageLifecycle = false,
	id,
	onDelete,
	onEdit,
	onRestore,
	state,
}: ExpenseDetailsProps) => {
	return (
		<EntityDetail.Root key={id} state={state}>
			<React.Suspense fallback={<ExpenseDetailsFallback />}>
				<ExpenseDetailsContent
					canManageLifecycle={canManageLifecycle}
					id={id}
					onDelete={onDelete}
					onEdit={onEdit}
					onRestore={onRestore}
				/>
			</React.Suspense>
		</EntityDetail.Root>
	);
};

interface ExpenseDetailsContentProps {
	canManageLifecycle: boolean;
	id: EntityId;
	onDelete?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

function ExpenseDetailsContent({
	canManageLifecycle,
	id,
	onDelete,
	onEdit,
	onRestore,
}: ExpenseDetailsContentProps) {
	const { expense } = useExpense(id);
	const actions = getExpenseLifecycleActions({
		canManageLifecycle,
		isSoftDeleted: expense.isSoftDeleted,
	});

	const generalInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Categoria", definition: expense.category },
			{ term: "Data", definition: formatter.date(expense.expenseDate) },
			{ term: "Valor", definition: formatter.currency(expense.amount) },
		],
		[expense],
	);

	const registerInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Situação",
				definition: (
					<EntityStatus
						isActive={expense.isActive}
						isSoftDeleted={expense.isSoftDeleted}
					/>
				),
			},
			{ term: "Criado em", definition: formatter.date(expense.createdAt) },
			{
				term: "Atualizado em",
				definition: expense.updatedAt ? formatter.date(expense.updatedAt) : "—",
			},
		],
		[expense],
	);

	return (
		<EntityDetail.Content>
			<EntityDetail.Header className="flex-row items-center justify-between gap-3">
				<EntityDetail.Title>{`${expense.category} • ${formatter.currency(expense.amount)}`}</EntityDetail.Title>
				<EntityActions
					canView={false}
					canEdit={actions.canEdit}
					canRestore={actions.canRestore}
					canDelete={actions.canDelete}
					onEdit={onEdit ? () => onEdit(id) : undefined}
					onRestore={onRestore ? () => onRestore(id) : undefined}
					onDelete={onDelete ? () => onDelete(id) : undefined}
				/>
			</EntityDetail.Header>
			<EntityDetail.Body>
				<EntityDetail.Fields items={generalInfo} />
				<EntityDetail.Separator />
				<EntityDetail.Section title="Observação">
					<p className="text-sm">{expense.notes?.trim() || "—"}</p>
				</EntityDetail.Section>
				<EntityDetail.Separator />
				<EntityDetail.Section title="Anexos">
					<AttachmentSection canUpload ownerId={id} ownerKind="expense" />
				</EntityDetail.Section>
				<EntityDetail.Separator />
				<EntityDetail.Section title="Registro">
					<EntityDetail.Fields items={registerInfo} />
				</EntityDetail.Section>
			</EntityDetail.Body>
			<EntityDetail.Footer />
		</EntityDetail.Content>
	);
}

const ExpenseDetailsFallback = () => (
	<EntityDetail.Content>
		<EntityDetail.Header>
			<EntityDetail.Title>
				<EntityDetail.SkeletonTitle />
			</EntityDetail.Title>
		</EntityDetail.Header>
		<EntityDetail.Body>
			<EntityDetail.SkeletonFields rows={3} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Observação">
				<EntityDetail.SkeletonFields rows={1} />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Anexos">
				<AttachmentSection
					canUpload
					ownerId={idPlaceholder}
					ownerKind="expense"
				/>
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.SkeletonFields rows={3} />
			</EntityDetail.Section>
		</EntityDetail.Body>
		<EntityDetail.Footer />
	</EntityDetail.Content>
);

const idPlaceholder = 0 as EntityId;
