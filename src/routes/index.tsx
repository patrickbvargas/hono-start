import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<div className="min-h-screen flex justify-center bg-linear-to-b from-slate-900 via-slate-800 to-slate-900">
			<h1 className="text-6xl md:text-7xl font-black text-white tracking-[-0.08em]">
				<span className="text-gray-300">TANSTACK</span>{" "}
				<span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
					START
				</span>
			</h1>
		</div>
	);
}
