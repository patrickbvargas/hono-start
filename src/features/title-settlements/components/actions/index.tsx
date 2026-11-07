import { TableButton } from "@/shared/components/table-button";
import { Button } from "@/shared/components/ui";
import { useSettlementActions } from "../../hooks/use-actions";
import { SettlementForm } from "../form";
import { ReversalForm } from "../reversal";

interface TitleSettlementActionProps {
	direction: "receivable" | "payable";
	titleId: number;
	balance: number;
	cancelledAt: string | null;
	method: string;
	contractId: number | null;
	isAssignedToActor: boolean;
}
export function TitleSettlementAction(props: TitleSettlementActionProps) {
	const { overlay, canCreate } = useSettlementActions(props);
	if (!canCreate || props.cancelledAt || props.balance <= 0) {
		return null;
	}
	return (
		<>
			<Button type="button" size="sm" onClick={overlay.create.open}>
				{props.direction === "receivable"
					? "Registrar recebimento"
					: "Registrar pagamento"}
			</Button>
			{overlay.create.render((state) => (
				<SettlementForm
					target={{ direction: props.direction, titleId: props.titleId }}
					balance={props.balance}
					method={props.method}
					isContract={!!props.contractId}
					state={state}
				/>
			))}
		</>
	);
}

interface SettlementReversalActionProps {
	direction: "receivable" | "payable";
	titleId: number;
	movementId: number;
}
export function SettlementReversalAction({
	direction,
	titleId,
	movementId,
}: SettlementReversalActionProps) {
	const { overlay, canReverse } = useSettlementActions({ direction });
	if (!canReverse) {
		return null;
	}
	return (
		<>
			<TableButton
				aria-haspopup="dialog"
				aria-expanded={overlay.create.isOpen}
				onClick={overlay.create.open}
			>
				Estornar
			</TableButton>
			{overlay.create.render((state) => (
				<ReversalForm
					target={{ direction, titleId }}
					movementId={movementId}
					state={state}
				/>
			))}
		</>
	);
}
