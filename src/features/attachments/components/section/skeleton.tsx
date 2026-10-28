import { SectionTitle } from "@/shared/components/section-title";
import { Skeleton } from "@/shared/components/ui";

export function AttachmentSectionSkeleton() {
	return (
		<div className="flex h-16 items-center gap-3 px-2 py-1" aria-hidden="true">
			<Skeleton className="h-10 w-11 shrink-0 rounded-md" />
			<div className="flex min-w-0 flex-1 flex-col gap-2">
				<Skeleton className="h-4 w-56 max-w-full" />
				<Skeleton className="h-3 w-72 max-w-full" />
			</div>
			<Skeleton className="h-7 w-14 shrink-0" />
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
		<section className="flex flex-col gap-2">
			<div className="flex min-h-8 items-center justify-between gap-3">
				<SectionTitle>Anexos</SectionTitle>
				{canUpload ? <Skeleton className="h-8 w-20" /> : null}
			</div>
			<AttachmentSectionSkeleton />
		</section>
	);
}
