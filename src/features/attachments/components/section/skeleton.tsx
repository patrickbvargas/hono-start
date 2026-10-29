import { SectionTitle } from "@/shared/components/section-title";
import { Skeleton } from "@/shared/components/ui";

export function AttachmentSectionSkeleton() {
	return (
		<div
			className="flex min-h-16 min-w-0 items-center gap-3 px-2 py-3"
			aria-hidden="true"
		>
			<Skeleton className="h-10 w-11 shrink-0 rounded-md" />
			<div className="flex min-w-0 flex-1 flex-col gap-2">
				<Skeleton className="h-4 w-56 max-w-full" />
				<Skeleton className="h-3 w-72 max-w-full" />
			</div>
			<div className="flex shrink-0 items-center gap-1">
				<Skeleton className="size-7" />
				<Skeleton className="size-7" />
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
		<section className="flex flex-col gap-2">
			<div className="flex shrink-0 items-center justify-between gap-3">
				<SectionTitle>Anexos</SectionTitle>
				{canUpload ? (
					<div className="-my-1.5 shrink-0">
						<Skeleton className="h-8 w-20" />
					</div>
				) : null}
			</div>
			<AttachmentSectionSkeleton />
		</section>
	);
}
