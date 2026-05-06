import { Skeleton } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface FormFieldSkeletonProps {
	labelWidth?: string;
	controlClassName?: string;
	className?: string;
}

export function FormFieldSkeleton({
	labelWidth = "w-20",
	controlClassName,
	className,
}: FormFieldSkeletonProps) {
	return (
		<div className={cn("flex w-full flex-col gap-2", className)}>
			<Skeleton className={cn("h-3 rounded-sm", labelWidth)} />
			<Skeleton className={cn("h-8 rounded-lg", controlClassName)} />
		</div>
	);
}

interface FormTextAreaSkeletonProps {
	labelWidth?: string;
	controlClassName?: string;
	className?: string;
}

export function FormTextAreaSkeleton({
	labelWidth = "w-28",
	controlClassName,
	className,
}: FormTextAreaSkeletonProps) {
	return (
		<div className={cn("flex w-full flex-col gap-2", className)}>
			<Skeleton className={cn("h-3 rounded-sm", labelWidth)} />
			<Skeleton className={cn("min-h-16 rounded-lg", controlClassName)} />
		</div>
	);
}

interface FormCheckboxSkeletonProps {
	labelWidth?: string;
	className?: string;
}

export function FormCheckboxSkeleton({
	labelWidth = "w-16",
	className,
}: FormCheckboxSkeletonProps) {
	return (
		<div
			className={cn(
				"flex w-full items-center justify-between gap-2 pt-0.5",
				className,
			)}
		>
			<Skeleton className={cn("h-4 rounded-sm", labelWidth)} />
			<Skeleton className="size-4 rounded-lg" />
		</div>
	);
}
