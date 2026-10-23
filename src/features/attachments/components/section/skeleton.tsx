import { Separator, Skeleton } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

export function AttachmentSectionSkeleton() {
	const skeletonRows = [
		{
			key: "attachment-skeleton-primary",
			fileWidth: "w-40",
			showSeparator: true,
		},
		{
			key: "attachment-skeleton-secondary",
			fileWidth: "w-32",
			showSeparator: false,
		},
	];

	return (
		<div className="px-3 py-3">
			<div className="flex flex-col gap-3">
				{skeletonRows.map((row) => (
					<div key={row.key}>
						<div className="flex items-center justify-between gap-3 py-1">
							<Skeleton className={cn("h-4 rounded-sm", row.fileWidth)} />
							<Skeleton className="h-4 w-4 rounded-sm" />
						</div>
						{row.showSeparator ? <Separator className="mt-3" /> : null}
					</div>
				))}
			</div>
		</div>
	);
}
