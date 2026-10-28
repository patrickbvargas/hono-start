import { useEffect, useState } from "react";
import { DEFAULT_FAVICON_URL } from "../schemas/model";

export function useFavicon(imageUrl: string | undefined) {
	const [loadedUrl, setLoadedUrl] = useState<string>();

	useEffect(() => {
		if (!imageUrl) {
			return;
		}
		let active = true;
		const image = new Image();
		const timeout = window.setTimeout(() => {
			active = false;
			setLoadedUrl(undefined);
		}, 10_000);
		image.onload = () => {
			if (active) {
				window.clearTimeout(timeout);
				setLoadedUrl(imageUrl);
			}
		};
		image.onerror = () => {
			if (active) {
				window.clearTimeout(timeout);
				setLoadedUrl(undefined);
			}
		};
		image.src = imageUrl;
		return () => {
			active = false;
			window.clearTimeout(timeout);
			image.onload = null;
			image.onerror = null;
		};
	}, [imageUrl]);

	return imageUrl && loadedUrl === imageUrl ? imageUrl : DEFAULT_FAVICON_URL;
}
