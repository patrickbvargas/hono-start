import { Skeleton } from "@/shared/components/ui/skeleton";

export const RouteLoading = () => {
	return (
		<div className="flex flex-col gap-4 p-4">
			<Skeleton className="h-8 w-48" />
			<Skeleton className="h-64 w-full" />
			<Skeleton className="h-10 w-full" />
		</div>
	);
};
