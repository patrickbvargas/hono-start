import { SectionTitle } from "@/shared/components/section-title";
import { Skeleton } from "@/shared/components/ui";

export function AttachmentSectionSkeleton() {
	return (
		<div className="flex h-5 items-center" aria-hidden="true">
			<Skeleton className="h-4 w-44 max-w-full" />
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
