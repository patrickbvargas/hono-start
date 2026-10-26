import type { ReactNode } from "react";
import { EntityFields } from "@/shared/components/entity-fields";
import { FormSection } from "@/shared/components/form-section";
import {
	Button,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/shared/components/ui";
import { Wrapper, WrapperBody } from "@/shared/components/wrapper";
import { formatter } from "@/shared/lib/formatter";

interface WorkspaceSection {
	value: string;
	label: string;
	content: ReactNode;
	expanded?: boolean;
	fullWidth?: boolean;
}

interface EntityWorkspaceProps {
	title: string;
	identity: ReactNode;
	subtitle?: ReactNode;
	status?: ReactNode;
	returnLink: ReactNode;
	tab: string;
	onTabChange: (tab: string) => void;
	sections: readonly WorkspaceSection[];
	onEdit?: () => void;
	onDelete?: () => void;
	onRestore?: () => void;
	children?: ReactNode;
}

export function EntityWorkspace({
	title,
	identity,
	subtitle,
	status,
	returnLink,
	tab,
	onTabChange,
	sections,
	onEdit,
	onDelete,
	onRestore,
	children,
}: EntityWorkspaceProps): ReactNode {
	return (
		<Wrapper
			title={title}
			actions={
				onEdit || onDelete || onRestore ? (
					<div
						data-slot="workspace-actions"
						className="flex shrink-0 items-center gap-1.5"
					>
						{onEdit && (
							<Button size="sm" variant="outline" onClick={onEdit}>
								Editar
							</Button>
						)}
						{onRestore && (
							<Button size="sm" variant="outline" onClick={onRestore}>
								Restaurar
							</Button>
						)}
						{onDelete && (
							<Button size="sm" variant="destructive" onClick={onDelete}>
								Excluir
							</Button>
						)}
					</div>
				) : undefined
			}
		>
			<WrapperBody className="gap-3 overflow-hidden">
				<div className="w-fit shrink-0 text-sm underline underline-offset-4">
					{returnLink}
				</div>
				<div
					data-slot="workspace-header"
					className="flex min-w-0 shrink-0 items-center gap-3 py-2"
				>
					<h2
						className="min-w-0 truncate text-base font-semibold sm:text-lg"
						title={typeof identity === "string" ? identity : undefined}
					>
						{identity}
					</h2>
					{subtitle && (
						<span className="shrink-0 text-xs text-muted-foreground">
							{subtitle}
						</span>
					)}
					{status && (
						<div className="ml-auto flex shrink-0 items-center gap-1.5">
							{status}
						</div>
					)}
				</div>
				<Tabs
					value={tab}
					onValueChange={(value) => onTabChange(value)}
					className="min-h-0 flex-1 gap-3 overflow-hidden"
				>
					<div className="shrink-0 overflow-x-auto overflow-y-hidden pb-1">
						<TabsList aria-label={`Seções: ${title}`}>
							{sections.map((section) => (
								<TabsTrigger key={section.value} value={section.value}>
									{section.label}
								</TabsTrigger>
							))}
						</TabsList>
					</div>
					{sections.map((section) => (
						<TabsContent
							key={section.value}
							value={section.value}
							className={
								section.expanded
									? "min-h-0 min-w-0 w-full max-w-4xl flex-1 overflow-hidden"
									: "min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain"
							}
						>
							{tab === section.value &&
								(section.expanded ? (
									section.content
								) : (
									<div
										className={
											section.fullWidth
												? "w-full space-y-5"
												: "w-full max-w-4xl space-y-5"
										}
									>
										{section.content}
									</div>
								))}
						</TabsContent>
					))}
				</Tabs>
				{children}
			</WrapperBody>
		</Wrapper>
	);
}

interface EntityWorkspaceHistoryProps {
	createdAt: string;
	updatedAt?: string | null;
	children: ReactNode;
}

export function EntityWorkspaceHistory({
	createdAt,
	updatedAt,
	children,
}: EntityWorkspaceHistoryProps): ReactNode {
	return (
		<div className="space-y-6">
			<div className="max-w-4xl">
				<FormSection title="Dados do registro">
					<EntityFields
						columns={2}
						items={[
							{ term: "Criado em", definition: formatter.date(createdAt) },
							{
								term: "Atualizado em",
								definition: updatedAt ? formatter.date(updatedAt) : "—",
							},
						]}
					/>
				</FormSection>
			</div>
			<FormSection title="Alterações registradas">{children}</FormSection>
		</div>
	);
}
