import { formatter } from "@/shared/lib/formatter";

interface PendingWorkDueDateProps {
	date: string | null;
	overdueDays: number | null;
}

export function PendingWorkDueDate({
	date,
	overdueDays,
}: PendingWorkDueDateProps) {
	return date ? (
		<div className="whitespace-nowrap">
			<p>{formatter.calendarDate(date)}</p>
			{overdueDays !== null && (
				<p className="text-xs text-muted-foreground">
					há {overdueDays} {overdueDays === 1 ? "dia" : "dias"}
				</p>
			)}
		</div>
	) : (
		<>—</>
	);
}
