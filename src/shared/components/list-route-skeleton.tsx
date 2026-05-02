import { Skeleton } from "@/shared/components/ui";
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";

interface ListRouteSkeletonProps {
	title: string;
	showActions?: boolean;
	rowCount?: number;
}

export const ListRouteSkeleton = ({
	title,
	showActions = false,
	rowCount = 12,
}: ListRouteSkeletonProps) => {
	const rowKeys = Array.from(
		{ length: rowCount },
		(_, index) => `list-route-skeleton-row-${index + 1}`,
	);

	return (
		<Wrapper
			title={title}
			actions={
				showActions ? <Skeleton className="h-9 w-36 rounded-md" /> : undefined
			}
		>
			<WrapperHeader>
				<div className="flex w-full items-center justify-between gap-3">
					<Skeleton className="h-10 w-full max-w-80 rounded-md" />
					<Skeleton className="h-10 w-10 rounded-md" />
				</div>
			</WrapperHeader>
			<WrapperBody>
				<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
					<div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-input">
						<div className="grid h-10 grid-cols-6 items-center gap-4 border-b bg-sidebar px-4">
							<Skeleton className="h-4 w-12" />
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-4 w-16 justify-self-end" />
						</div>
						<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
							{rowKeys.map((rowKey) => (
								<div
									key={rowKey}
									className="grid min-h-10 grid-cols-6 items-center gap-4 border-b px-4 py-2 last:flex-1 last:border-b-0"
								>
									<Skeleton className="h-4 w-14" />
									<Skeleton className="h-4 w-full max-w-56" />
									<Skeleton className="h-4 w-full max-w-36" />
									<Skeleton className="h-4 w-full max-w-28" />
									<Skeleton className="h-5 w-20 rounded-full" />
									<Skeleton className="h-7 w-7 justify-self-end rounded-md" />
								</div>
							))}
						</div>
						<div className="border-t bg-background px-3 py-2">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
								<div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
									<Skeleton className="h-4 w-52" />
									<div className="flex items-center justify-end gap-2">
										<Skeleton className="h-4 w-18" />
										<Skeleton className="h-7 w-20 rounded-[min(var(--radius-md),10px)]" />
									</div>
								</div>
								<div className="flex items-center justify-end gap-2">
									<Skeleton className="h-8 w-8 rounded-lg" />
									<Skeleton className="h-8 w-8 rounded-lg" />
									<Skeleton className="h-8 w-8 rounded-lg" />
									<Skeleton className="h-8 w-8 rounded-lg" />
									<Skeleton className="h-8 w-8 rounded-lg" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</WrapperBody>
		</Wrapper>
	);
};
