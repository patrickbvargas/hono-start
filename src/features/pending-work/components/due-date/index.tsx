import { formatter } from "@/shared/lib/formatter";

interface PendingWorkDueDateProps {
	date: string | null;
	inline?: boolean;
	overdueDays: number | null;
}

export function PendingWorkDueDate({
	date,
	overdueDays,
	inline = false,
}: PendingWorkDueDateProps) {
	return date ? (
		<div
			className={
				inline
					? "flex flex-wrap items-baseline gap-x-2 whitespace-nowrap"
					: "whitespace-nowrap"
			}
		>
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
