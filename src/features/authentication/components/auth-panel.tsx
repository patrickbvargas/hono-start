import { Link } from "@tanstack/react-router";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui";

interface AuthPanelProps {
	children: React.ReactNode;
	description: string;
	eyebrow: string;
	footer?: React.ReactNode;
	title: string;
}

export function AuthPanel({
	children,
	description,
	eyebrow,
	footer,
	title,
}: AuthPanelProps) {
	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(198,232,255,0.85),_transparent_35%),linear-gradient(135deg,_#f6efe2_0%,_#fffaf2_42%,_#f2f7f4_100%)] px-6 py-10">
			<div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
				<div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
					<section className="hidden rounded-[2rem] border border-white/60 bg-white/55 p-10 shadow-[0_30px_80px_rgba(105,86,36,0.12)] backdrop-blur lg:flex lg:flex-col lg:justify-between">
						<div className="space-y-6">
							<p className="text-sm font-semibold uppercase tracking-[0.32em] text-amber-900/70">
								Hono
							</p>
							<div className="space-y-4">
								<h1 className="max-w-xl text-5xl leading-tight font-semibold text-slate-900">
									Gestão jurídica com acesso seguro por perfil e por firma.
								</h1>
								<p className="max-w-lg text-base leading-7 text-slate-700">
									Acesse seus contratos, honorários e remunerações com o mesmo
									contexto autenticado que protege todas as regras de tenant e
									permissão do produto.
								</p>
							</div>
						</div>
						<div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
							<div className="rounded-2xl border border-white/70 bg-white/75 p-4">
								<p className="font-medium text-slate-900">
									Login por email ou OAB
								</p>
								<p className="mt-1">
									Fluxo único em pt-BR para administradores e usuários.
								</p>
							</div>
							<div className="rounded-2xl border border-white/70 bg-white/75 p-4">
								<p className="font-medium text-slate-900">
									Sessão com escopo real
								</p>
								<p className="mt-1">
									Permissões continuam derivadas do colaborador autenticado.
								</p>
							</div>
						</div>
					</section>
					<Card className="border-white/70 bg-white/88 shadow-[0_24px_64px_rgba(69,62,42,0.16)] backdrop-blur">
						<CardHeader className="space-y-4">
							<div className="space-y-2">
								<p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-900/65">
									{eyebrow}
								</p>
								<CardTitle className="text-3xl text-slate-950">
									{title}
								</CardTitle>
								<CardDescription className="text-sm leading-6 text-slate-600">
									{description}
								</CardDescription>
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							{children}
							{footer}
							<p className="text-center text-sm text-slate-500">
								<Link to="/login" className="underline underline-offset-4">
									Voltar ao login
								</Link>
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
