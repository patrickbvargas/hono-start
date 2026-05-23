import { Wrapper, WrapperBody } from "@/shared/components/wrapper";
import { cn } from "@/shared/lib/utils";

interface RouteFeedbackProps {
	title?: string;
	eyebrow: string;
	heading: string;
	description: string;
	watermark: string;
	icon: React.ReactNode;
	actions: React.ReactNode;
	className?: string;
}

export function RouteFeedback({
	title,
	eyebrow,
	heading,
	description,
	watermark,
	icon,
	actions,
	className,
}: RouteFeedbackProps) {
	const content = (
		<section
			className={cn(
				"relative flex min-h-full flex-1 overflow-hidden",
				className,
			)}
		>
			<div className="relative grid w-full flex-1 items-center gap-12 px-6 py-10 lg:grid-cols-[minmax(0,30rem)_minmax(18rem,1fr)] lg:px-10 lg:py-12">
				<div className="max-w-2xl">
					<div className="inline-flex items-center gap-3 text-[0.7rem] font-semibold tracking-[0.28em] text-primary uppercase">
						<span className="h-px w-8 bg-primary/50" />
						{eyebrow}
					</div>
					<h2 className="mt-5 max-w-xl font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
						{heading}
					</h2>
					<p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
						{description}
					</p>
					<div className="mt-8 flex flex-wrap items-center gap-3">
						{actions}
					</div>
				</div>
				<div className="relative hidden min-h-[22rem] items-center justify-center lg:flex">
					<div className="absolute inset-x-10 top-1/2 h-52 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
					<div
						aria-hidden="true"
						className="select-none text-[10rem] font-semibold tracking-[-0.14em] text-foreground/6 xl:text-[13rem]"
					>
						{watermark}
					</div>
					<div className="absolute flex size-28 items-center justify-center rounded-full bg-background/85 text-primary shadow-lg ring-1 ring-border/50 backdrop-blur">
						{icon}
					</div>
				</div>
			</div>
		</section>
	);

	if (title) {
		return (
			<Wrapper title={title}>
				<WrapperBody>{content}</WrapperBody>
			</Wrapper>
		);
	}

	return content;
}
