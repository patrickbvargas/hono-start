import { createServerClient } from "@supabase/ssr";
import {
	getRequestHeaders,
	setResponseHeaders,
} from "@tanstack/react-start/server";
import {
	getAuthCookieMaxAge,
	getSupabasePublishableKey,
	getSupabaseUrl,
	isProductionEnvironment,
	SUPABASE_AUTH_STORAGE_KEY,
	SUPABASE_REMEMBER_ME_COOKIE_NAME,
} from "./auth";

interface CookieOptions {
	domain?: string;
	expires?: Date;
	httpOnly?: boolean;
	maxAge?: number;
	path?: string;
	sameSite?: boolean | "lax" | "strict" | "none";
	secure?: boolean;
}

interface PendingCookie {
	name: string;
	options?: CookieOptions;
	value: string;
}

interface CreateSupabaseServerClientOptions {
	rememberMe?: boolean;
}

function parseCookieHeader(cookieHeader: string | null) {
	if (!cookieHeader) {
		return [];
	}

	return cookieHeader
		.split(";")
		.map((part) => part.trim())
		.filter((part) => part.length > 0)
		.map((part) => {
			const separatorIndex = part.indexOf("=");

			if (separatorIndex === -1) {
				return {
					name: part,
					value: "",
				};
			}

			return {
				name: part.slice(0, separatorIndex).trim(),
				value: part.slice(separatorIndex + 1).trim(),
			};
		});
}

function serializeCookie({ name, options, value }: PendingCookie) {
	const segments = [`${name}=${value}`];

	if (options?.maxAge !== undefined) {
		segments.push(`Max-Age=${Math.floor(options.maxAge)}`);
	}

	if (options?.domain) {
		segments.push(`Domain=${options.domain}`);
	}

	if (options?.path) {
		segments.push(`Path=${options.path}`);
	}

	if (options?.expires) {
		segments.push(`Expires=${options.expires.toUTCString()}`);
	}

	if (options?.httpOnly) {
		segments.push("HttpOnly");
	}

	if (options?.secure) {
		segments.push("Secure");
	}

	if (options?.sameSite) {
		segments.push(`SameSite=${options.sameSite}`);
	}

	return segments.join("; ");
}

function getRememberMePreferenceFromRequest() {
	const cookieHeader = getRequestHeaders().get("cookie");
	const rememberMeCookie = parseCookieHeader(cookieHeader).find((cookie) => {
		return cookie.name === SUPABASE_REMEMBER_ME_COOKIE_NAME;
	});

	return rememberMeCookie?.value === "1";
}

export function createSupabaseServerClient(
	options: CreateSupabaseServerClientOptions = {},
) {
	const pendingCookies: PendingCookie[] = [];
	const pendingHeaders = new Headers();
	const rememberMe = options.rememberMe ?? getRememberMePreferenceFromRequest();
	const requestHeaders = getRequestHeaders();

	const client = createServerClient(
		getSupabaseUrl(),
		getSupabasePublishableKey(),
		{
			auth: {
				storageKey: SUPABASE_AUTH_STORAGE_KEY,
			},
			cookieOptions: {
				httpOnly: true,
				maxAge: getAuthCookieMaxAge(rememberMe),
				path: "/",
				sameSite: "lax",
				secure: isProductionEnvironment(),
			},
			cookies: {
				getAll: () => {
					return parseCookieHeader(requestHeaders.get("cookie"));
				},
				setAll: (cookiesToSet, headers) => {
					pendingCookies.push(
						...cookiesToSet.map((cookie) => ({
							name: cookie.name,
							options: cookie.options,
							value: cookie.value,
						})),
					);

					for (const [name, value] of Object.entries(headers ?? {})) {
						pendingHeaders.set(name, value);
					}
				},
			},
		},
	);

	function flushResponseCookies(extraCookies: PendingCookie[] = []) {
		const responseHeaders = new Headers(pendingHeaders);
		const cookiesToWrite = [...pendingCookies, ...extraCookies];

		for (const cookie of cookiesToWrite) {
			responseHeaders.append("set-cookie", serializeCookie(cookie));
		}

		if (Array.from(responseHeaders.keys()).length > 0) {
			setResponseHeaders(responseHeaders);
		}
	}

	return {
		client,
		flushResponseCookies,
		rememberMe,
	};
}

export function createRememberMeCookie(rememberMe: boolean): PendingCookie {
	return {
		name: SUPABASE_REMEMBER_ME_COOKIE_NAME,
		options: {
			httpOnly: true,
			maxAge: getAuthCookieMaxAge(rememberMe),
			path: "/",
			sameSite: "lax",
			secure: isProductionEnvironment(),
		},
		value: rememberMe ? "1" : "0",
	};
}

export function createClearedRememberMeCookie(): PendingCookie {
	return {
		name: SUPABASE_REMEMBER_ME_COOKIE_NAME,
		options: {
			httpOnly: true,
			maxAge: 0,
			path: "/",
			sameSite: "lax",
			secure: isProductionEnvironment(),
		},
		value: "",
	};
}
