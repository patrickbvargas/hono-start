import { Skeleton } from "@/shared/components/ui";

export function AttachmentSectionSkeleton() {
	return (
		<div className="rounded-lg border p-3 space-y-3">
			<Skeleton className="h-5 w-40" />
			<div className="grid grid-cols-2 gap-4">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-10 w-full" />
			</div>
		</div>
	);
}

interface AttachmentSectionFallbackProps {
	canUpload?: boolean;
}

export function AttachmentSectionFallback({
	canUpload = true,
}: AttachmentSectionFallbackProps) {
	return (
		<div className="flex flex-col gap-3" aria-hidden="true">
			{canUpload ? <Skeleton className="h-8 w-28" /> : null}
			<AttachmentSectionSkeleton />
		</div>
	);
}
