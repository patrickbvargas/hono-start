export function isSidebarRouteActive(pathname: string, url: string) {
	if (url === "/") {
		return pathname === "/";
	}

	return pathname === url || pathname.startsWith(`${url}/`);
}
