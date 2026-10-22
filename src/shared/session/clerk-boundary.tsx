import { useAuth } from "@clerk/tanstack-react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

interface ClerkSessionBoundaryProps {
	children: React.ReactNode;
}

export function ClerkSessionBoundary({ children }: ClerkSessionBoundaryProps) {
	const { isLoaded, userId, sessionId, orgId, sessionClaims } = useAuth();
	const queryClient = useQueryClient();
	const router = useRouter();
	const fingerprint = JSON.stringify([
		userId,
		sessionId,
		orgId,
		sessionClaims?.o,
	]);
	const previous = useRef(fingerprint);
	const [settled, setSettled] = useState(fingerprint);
	useEffect(() => {
		if (!isLoaded || previous.current === fingerprint) {
			return;
		}
		previous.current = fingerprint;
		let active = true;
		void (async () => {
			await queryClient.cancelQueries();
			queryClient.clear();
			await router.invalidate();
			if (active) {
				setSettled(fingerprint);
			}
		})();
		return () => {
			active = false;
		};
	}, [fingerprint, isLoaded, queryClient, router]);
	if (!isLoaded || settled !== fingerprint) {
		return null;
	}
	return children;
}
