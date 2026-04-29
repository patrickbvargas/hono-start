import { Link } from "@tanstack/react-router";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Separator,
} from "@/shared/components/ui";

interface AuthenticationScreenProps {
	children: React.ReactNode;
	description: string;
	footer?: React.ReactNode;
	showBackToLoginLink?: boolean;
	title: string;
}

export function AuthenticationScreen({
	children,
	description,
	footer,
	showBackToLoginLink = true,
	title,
}: AuthenticationScreenProps) {
	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{children}
				{footer ? (
					<>
						<Separator />
						{footer}
					</>
				) : null}
				{showBackToLoginLink ? (
					<p className="text-center text-sm text-muted-foreground">
						<Link to="/login" className="underline underline-offset-4">
							Voltar ao login
						</Link>
					</p>
				) : null}
			</CardContent>
		</Card>
	);
}
