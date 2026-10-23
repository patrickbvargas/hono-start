import { Skeleton } from "@/shared/components/ui";

export function AttachmentSectionSkeleton() {
	return (
		<div className="rounded-md border border-dashed px-3 py-4">
			<Skeleton className="h-5 w-40" />
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
