import {
	type KeyboardEvent,
	type PointerEvent,
	type SyntheticEvent,
	useEffect,
	useRef,
	useState,
} from "react";

interface UseImagePreviewOptions {
	onLoad: () => void;
}

export function useImagePreview({ onLoad }: UseImagePreviewOptions) {
	const viewportRef = useRef<HTMLDivElement>(null);
	const drag = useRef<{
		id: number;
		x: number;
		y: number;
		left: number;
		top: number;
	} | null>(null);
	const [viewport, setViewport] = useState({ width: 0, height: 0 });
	const [image, setImage] = useState({ width: 0, height: 0 });
	const [zoom, setZoom] = useState<number | null>(null);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	useEffect(() => {
		const element = viewportRef.current;
		if (!element) {
			return;
		}
		const measure = () => {
			const rect = element.getBoundingClientRect();
			setViewport({ width: rect.width, height: rect.height });
			setPosition({ x: 0, y: 0 });
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	}, []);
	const fit =
		image.width && viewport.width && viewport.height
			? Math.min(
					viewport.width / image.width,
					viewport.height / image.height,
					1,
				)
			: 1;
	const scale = zoom ?? fit;
	const maxX = Math.max(0, (image.width * scale - viewport.width) / 2);
	const maxY = Math.max(0, (image.height * scale - viewport.height) / 2);
	const clamp = (x: number, y: number) => ({
		x: Math.max(-maxX, Math.min(maxX, x)),
		y: Math.max(-maxY, Math.min(maxY, y)),
	});
	const setScale = (value: number | null) => {
		setZoom(value);
		setPosition({ x: 0, y: 0 });
	};
	const finishDrag = (event: PointerEvent<HTMLImageElement>) => {
		if (drag.current?.id !== event.pointerId) {
			return;
		}
		drag.current = null;
		setIsDragging(false);
	};
	return {
		viewportRef,
		percent: Math.round(scale * 100),
		canZoomOut: scale > Math.min(fit, 0.1),
		canZoomIn: scale < 8,
		canPan: maxX > 0 || maxY > 0,
		isDragging,
		zoomIn: () => setScale(Math.min(8, scale + 0.25)),
		zoomOut: () => setScale(Math.max(Math.min(fit, 0.1), scale - 0.25)),
		original: () => setScale(1),
		fit: () => setScale(null),
		imageStyle: image.width
			? {
					width: image.width,
					height: image.height,
					transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})`,
				}
			: undefined,
		onLoad: (event: SyntheticEvent<HTMLImageElement>) => {
			setImage({
				width: event.currentTarget.naturalWidth,
				height: event.currentTarget.naturalHeight,
			});
			onLoad();
		},
		onPointerDown: (event: PointerEvent<HTMLImageElement>) => {
			if (event.button !== 0 || (!maxX && !maxY)) {
				return;
			}
			event.preventDefault();
			event.currentTarget.setPointerCapture(event.pointerId);
			drag.current = {
				id: event.pointerId,
				x: event.clientX,
				y: event.clientY,
				left: position.x,
				top: position.y,
			};
			setIsDragging(true);
		},
		onPointerMove: (event: PointerEvent<HTMLImageElement>) => {
			const start = drag.current;
			if (start?.id !== event.pointerId) {
				return;
			}
			setPosition(
				clamp(
					start.left + event.clientX - start.x,
					start.top + event.clientY - start.y,
				),
			);
		},
		onPointerUp: finishDrag,
		onPointerCancel: finishDrag,
		onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
			if (event.target !== event.currentTarget) {
				return;
			}
			const delta = {
				ArrowLeft: [40, 0],
				ArrowRight: [-40, 0],
				ArrowUp: [0, 40],
				ArrowDown: [0, -40],
			}[event.key];
			if (delta) {
				event.preventDefault();
				setPosition(clamp(position.x + delta[0], position.y + delta[1]));
			}
		},
	};
}
