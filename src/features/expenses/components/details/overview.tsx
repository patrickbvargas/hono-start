import * as React from "react";
import { AttachmentSection } from "@/features/attachments";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { FormSection } from "@/shared/components/form-section";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { useExpense } from "../../hooks/use-data";

interface ExpenseOverviewProps {
	section?: "all" | "overview";
	id: EntityId;
	includeAttachments?: boolean;
}
export function ExpenseOverview({
	id,
	includeAttachments = true,
	section = "all",
}: ExpenseOverviewProps) {
	const { expense } = useExpense(id);
	const session = useLoggedUserSession();

	const generalInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Categoria", definition: expense.category },
			{ term: "Data", definition: formatter.calendarDate(expense.expenseDate) },
			{
				term: "Valor",
				definition: (
					<SensitiveValue>{formatter.currency(expense.amount)}</SensitiveValue>
				),
			},
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

	if (section === "overview") {
		return (
			<div className="space-y-6">
				<FormSection title="Dados da despesa">
					<EntityDetail.Fields
						columns={2}
						items={[
							...generalInfo,
							{
								term: "Observações",
								definition: expense.notes?.trim() || "—",
								classNames: {
									item: "col-span-2",
									definition: "whitespace-pre-wrap",
								},
							},
						]}
					/>
				</FormSection>
			</div>
		);
	}

	return (
		<div className="flex min-w-0 flex-col gap-3">
			<EntityDetail.Fields columns={2} items={generalInfo} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Observações">
				<p className="text-sm">{expense.notes?.trim() || "—"}</p>
			</EntityDetail.Section>
			{includeAttachments && hasPermission(session, "org:attachments:read") && (
				<>
					<EntityDetail.Separator />
					<AttachmentSection
						canUpload={
							!expense.isSoftDeleted &&
							hasPermission(session, "org:expenses:update")
						}
						ownerId={id}
						ownerKind="expense"
					/>
				</>
			)}
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.Fields columns={2} items={registerInfo} />
			</EntityDetail.Section>
		</div>
	);
}
