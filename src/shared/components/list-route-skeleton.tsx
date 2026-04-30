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
	rowCount = 8,
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
				<div className="space-y-4">
					<div className="overflow-hidden rounded-md border">
						<div className="grid grid-cols-6 gap-4 border-b px-4 py-3">
							<Skeleton className="h-4 w-12" />
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-4 w-16 justify-self-end" />
						</div>
						<div>
							{rowKeys.map((rowKey) => (
								<div
									key={rowKey}
									className="grid grid-cols-6 gap-4 border-b px-4 py-4 last:border-b-0"
								>
									<Skeleton className="h-4 w-14" />
									<Skeleton className="h-4 w-full max-w-56" />
									<Skeleton className="h-4 w-full max-w-36" />
									<Skeleton className="h-4 w-full max-w-28" />
									<Skeleton className="h-6 w-20 rounded-full" />
									<Skeleton className="h-8 w-8 justify-self-end rounded-md" />
								</div>
							))}
						</div>
					</div>
					<div className="flex items-center justify-between gap-3">
						<Skeleton className="h-4 w-52" />
						<div className="flex items-center gap-2">
							<Skeleton className="h-9 w-16 rounded-md" />
							<Skeleton className="h-9 w-24 rounded-md" />
							<Skeleton className="h-9 w-16 rounded-md" />
						</div>
					</div>
				</div>
			</WrapperBody>
		</Wrapper>
	);
};
