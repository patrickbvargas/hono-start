import { Skeleton } from "@/shared/components/ui";

interface DrilldownSkeletonProps {
	overview?: boolean;
	blocks?: 1 | 2;
}

export function DrilldownSkeleton({
	overview = false,
	blocks = 2,
}: DrilldownSkeletonProps) {
	return (
		<div
			role="status"
			aria-label="Carregando detalhes"
			className={
				overview
					? "py-3"
					: "flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg"
			}
		>
			{overview ? (
				<div
					className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
					aria-hidden="true"
				>
					{Array.from({ length: blocks }, (_, index) => `block-${index}`).map(
						(block) => (
							<div key={block} className="space-y-3">
								<Skeleton className="h-4 w-28" />
								{Array.from({ length: 5 }, (_, index) => `row-${index}`).map(
									(row) => (
										<div key={row} className="flex justify-between gap-4">
											<Skeleton className="h-5 w-1/2" />
											<Skeleton className="h-5 w-20" />
										</div>
									),
								)}
							</div>
						),
					)}
				</div>
			) : (
				<Skeleton
					aria-hidden="true"
					className="min-h-0 w-full flex-1 rounded-none"
				/>
			)}
		</div>
	);
}
