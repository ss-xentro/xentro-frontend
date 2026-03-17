"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ImageCropperProps {
	imageSrc: string;
	aspectRatio?: number;
	cropShape?: "circle" | "rect";
	onCropComplete: (croppedBlob: Blob) => void;
	onCancel: () => void;
	outputSize?: number;
}

export function ImageCropper({
	imageSrc,
	aspectRatio = 1,
	cropShape = "circle",
	onCropComplete,
	onCancel,
	outputSize = 512,
}: ImageCropperProps) {
	/* ─────────────────────────────── refs ─────────────────────────────── */
	const containerRef = useRef<HTMLDivElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);

	/* ─────────────────────────────── state ────────────────────────────── */
	const [zoom, setZoom] = useState(1);
	const [rotation, setRotation] = useState(0); // 0 | 90 | 180 | 270
	const [offset, setOffset] = useState({ x: 0, y: 0 }); // image-center offset from container-center (px)
	const [isDragging, setIsDragging] = useState(false); // for UI feedback only

	// layout — set once image & container are measured
	const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
	const [cropSize, setCropSize] = useState({ w: 0, h: 0 });
	const [baseDisplaySize, setBaseDisplaySize] = useState({ w: 0, h: 0 }); // natural → fits container (zoom=1)
	const [ready, setReady] = useState(false);

	/* ─────────────────────────── drag bookkeeping ──────────────────────── */
	const draggingRef = useRef(false); // use ref for immediate drag state updates
	const dragOrigin = useRef({ px: 0, py: 0 }); // pointer start (clientX/Y)
	const dragOffsetStart = useRef({ x: 0, y: 0 }); // offset at drag start
	const currentOffset = useRef({ x: 0, y: 0 }); // track current offset in ref

	/* ─────────────────────────── pinch bookkeeping ─────────────────────── */
	const pinchDist0 = useRef(0);
	const pinchZoom0 = useRef(1);

	const CROP_PADDING = 48;
	const MIN_ZOOM = 1;
	const MAX_ZOOM = 4;

	/* ══════════════════════════════════════════════════════════════════════
	 * 1. Layout calculation — runs once after image loads + on resize
	 * ════════════════════════════════════════════════════════════════════ */
	const calcLayout = useCallback(() => {
		const container = containerRef.current;
		const img = imageRef.current;
		if (!container || !img || !img.naturalWidth) return;

		const cw = container.clientWidth;
		const ch = container.clientHeight;

		/* ── crop rectangle (fixed, centred) ── */
		const availW = cw - CROP_PADDING * 2;
		const availH = ch - CROP_PADDING * 2;

		let cropW = availW;
		let cropH = cropW / aspectRatio;
		if (cropH > availH) {
			cropH = availH;
			cropW = cropH * aspectRatio;
		}
		if (cropShape === "circle") {
			const s = Math.min(cropW, cropH);
			cropW = s;
			cropH = s;
		}

		/* ── base display size: image scaled so shorter side fills the crop ── */
		const natW = img.naturalWidth;
		const natH = img.naturalHeight;
		const scaleX = cropW / natW;
		const scaleY = cropH / natH;
		const baseScale = Math.max(scaleX, scaleY); // image covers crop at zoom=1
		const dispW = natW * baseScale;
		const dispH = natH * baseScale;

		setContainerSize({ w: cw, h: ch });
		setCropSize({ w: cropW, h: cropH });
		setBaseDisplaySize({ w: dispW, h: dispH });
		const initialOffset = { x: 0, y: 0 };
		setOffset(initialOffset);
		currentOffset.current = initialOffset;
		setZoom(1);
		setReady(true);
	}, [aspectRatio, cropShape]);

	/* image load + resize listener */
	useEffect(() => {
		setReady(false);
		const img = imageRef.current;
		if (!img) return;

		const onLoad = () => {
			// small delay so DOM has settled
			setTimeout(calcLayout, 30);
		};

		if (img.complete && img.naturalWidth) {
			setTimeout(calcLayout, 30);
		} else {
			img.addEventListener("load", onLoad);
		}

		window.addEventListener("resize", calcLayout);
		return () => {
			img.removeEventListener("load", onLoad);
			window.removeEventListener("resize", calcLayout);
		};
	}, [imageSrc, calcLayout]);

	/* ══════════════════════════════════════════════════════════════════════
	 * 2. Constraint helpers
	 * ════════════════════════════════════════════════════════════════════ */

	/**
	 * Clamp offset so the scaled image always fully covers the crop rect.
	 * At the given zoom, the image is (baseW * zoom) × (baseH * zoom).
	 * The half-extents available before the image edge crosses the crop edge:
	 *   maxX = (scaledW - cropW) / 2
	 *   maxY = (scaledH - cropH) / 2
	 */
	const clampOffset = useCallback(
		(x: number, y: number, z: number) => {
			const scaledW = baseDisplaySize.w * z;
			const scaledH = baseDisplaySize.h * z;
			const maxX = Math.max(0, (scaledW - cropSize.w) / 2);
			const maxY = Math.max(0, (scaledH - cropSize.h) / 2);
			return {
				x: Math.min(maxX, Math.max(-maxX, x)),
				y: Math.min(maxY, Math.max(-maxY, y)),
			};
		},
		[baseDisplaySize, cropSize],
	);

	const applyZoom = useCallback(
		(nextZoom: number) => {
			const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
			setZoom(z);
			setOffset((prev) => clampOffset(prev.x, prev.y, z));
		},
		[clampOffset],
	);

	/* ══════════════════════════════════════════════════════════════════════
	 * 3. Pointer / touch events — all on the container
	 * ════════════════════════════════════════════════════════════════════ */
	const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		if (e.button !== undefined && e.button !== 0) return;
		e.preventDefault();
		dragOrigin.current = { px: e.clientX, py: e.clientY };
		dragOffsetStart.current = { ...currentOffset.current };
		draggingRef.current = true;
		setIsDragging(true);
		// pointer capture keeps events flowing even if pointer leaves the element
		containerRef.current?.setPointerCapture(e.pointerId);
	};

	const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
		if (!draggingRef.current) return;
		e.preventDefault();
		const dx = e.clientX - dragOrigin.current.px;
		const dy = e.clientY - dragOrigin.current.py;
		const next = clampOffset(
			dragOffsetStart.current.x + dx,
			dragOffsetStart.current.y + dy,
			zoom,
		);
		setOffset(next);
		currentOffset.current = next;
	};

	const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
		draggingRef.current = false;
		setIsDragging(false);
		containerRef.current?.releasePointerCapture(e.pointerId);
	};

	/* wheel zoom */
	const onWheel = useCallback(
		(e: WheelEvent) => {
			e.preventDefault();
			applyZoom(zoom + e.deltaY * -0.003);
		},
		[zoom, applyZoom],
	);

	/* attach wheel with { passive: false } to allow preventDefault */
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		el.addEventListener("wheel", onWheel, { passive: false });
		return () => el.removeEventListener("wheel", onWheel);
	}, [onWheel]);

	/* pinch zoom */
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const onTouchStart = (e: TouchEvent) => {
			if (e.touches.length === 2) {
				const dx = e.touches[0].clientX - e.touches[1].clientX;
				const dy = e.touches[0].clientY - e.touches[1].clientY;
				pinchDist0.current = Math.hypot(dx, dy);
				pinchZoom0.current = zoom;
			}
		};

		const onTouchMove = (e: TouchEvent) => {
			if (e.touches.length === 2) {
				e.preventDefault();
				const dx = e.touches[0].clientX - e.touches[1].clientX;
				const dy = e.touches[0].clientY - e.touches[1].clientY;
				const dist = Math.hypot(dx, dy);
				applyZoom(pinchZoom0.current * (dist / pinchDist0.current));
			}
		};

		el.addEventListener("touchstart", onTouchStart, { passive: true });
		el.addEventListener("touchmove", onTouchMove, { passive: false });
		return () => {
			el.removeEventListener("touchstart", onTouchStart);
			el.removeEventListener("touchmove", onTouchMove);
		};
	}, [zoom, applyZoom]);

	/* ══════════════════════════════════════════════════════════════════════
	 * 4. Rotation
	 * ════════════════════════════════════════════════════════════════════ */
	const handleRotate = () => {
		setRotation((r) => (r + 90) % 360);
		setOffset({ x: 0, y: 0 });
	};

	/* ══════════════════════════════════════════════════════════════════════
	 * 5. Crop math & canvas output
	 * ════════════════════════════════════════════════════════════════════ */
	const handleCrop = async () => {
		const img = imageRef.current;
		if (!img || !ready) return;

		const natW = img.naturalWidth;
		const natH = img.naturalHeight;

		/*
		 * In the container, the image is centred at:
		 *   (cw/2 + offset.x,  ch/2 + offset.y)
		 * and rendered at:
		 *   baseDisplaySize.w * zoom  ×  baseDisplaySize.h * zoom
		 *
		 * The crop rect is always centred in the container:
		 *   cropLeft = (cw - cropW) / 2
		 *   cropTop  = (ch - cropH) / 2
		 *
		 * So the crop's position relative to the image top-left:
		 *   dx = cropLeft − imageLeft
		 *      = (cw − cropW)/2 − (cw/2 + offset.x − scaledW/2)
		 *      = (scaledW − cropW)/2 − offset.x
		 *
		 * As a fraction of the scaled image:
		 *   relX = dx / scaledW  → in [0, 1]
		 *
		 * In natural pixels:
		 *   srcX = relX * natW
		 */
		const scaledW = baseDisplaySize.w * zoom;
		const scaledH = baseDisplaySize.h * zoom;

		const dx = (scaledW - cropSize.w) / 2 - offset.x;
		const dy = (scaledH - cropSize.h) / 2 - offset.y;

		const relX = dx / scaledW;
		const relY = dy / scaledH;
		const relW = cropSize.w / scaledW;
		const relH = cropSize.h / scaledH;

		/* output dimensions */
		const outW = outputSize;
		const outH = Math.round(outputSize / aspectRatio);

		/* if rotation != 0 we bake it into a temp canvas first */
		let sourceCanvas: HTMLCanvasElement | HTMLImageElement = img;
		let sourceW = natW;
		let sourceH = natH;

		if (rotation !== 0) {
			const isSwapped = rotation === 90 || rotation === 270;
			const tmpW = isSwapped ? natH : natW;
			const tmpH = isSwapped ? natW : natH;

			const tmp = document.createElement("canvas");
			tmp.width = tmpW;
			tmp.height = tmpH;
			const tctx = tmp.getContext("2d")!;
			tctx.translate(tmpW / 2, tmpH / 2);
			tctx.rotate((rotation * Math.PI) / 180);
			tctx.drawImage(img, -natW / 2, -natH / 2);

			sourceCanvas = tmp;
			sourceW = tmpW;
			sourceH = tmpH;
		}

		const srcX = relX * sourceW;
		const srcY = relY * sourceH;
		const srcW = relW * sourceW;
		const srcH = relH * sourceH;

		const canvas = document.createElement("canvas");
		canvas.width = outW;
		canvas.height = outH;
		const ctx = canvas.getContext("2d")!;
		ctx.clearRect(0, 0, outW, outH);
		ctx.drawImage(
			sourceCanvas as CanvasImageSource,
			srcX,
			srcY,
			srcW,
			srcH,
			0,
			0,
			outW,
			outH,
		);

		canvas.toBlob(
			(blob) => {
				if (blob) onCropComplete(blob);
			},
			"image/png",
			1.0,
		);
	};

	/* ══════════════════════════════════════════════════════════════════════
	 * 6. Derived UI values
	 * ════════════════════════════════════════════════════════════════════ */
	const zoomPct = Math.round(((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100);

	/* crop rect position (for overlay) */
	const cropLeft = (containerSize.w - cropSize.w) / 2;
	const cropTop = (containerSize.h - cropSize.h) / 2;

	/* image transform — translate(-50%,-50%) centres the image, then apply
		 user offset, zoom, and rotation. Order matters: offset is applied in
		 screen space (before scale) by using two translate steps. */
	const imgTransform = [
		"translate(-50%, -50%)",
		`translate(${offset.x}px, ${offset.y}px)`,
		`scale(${zoom})`,
		`rotate(${rotation}deg)`,
	].join(" ");

	/* ══════════════════════════════════════════════════════════════════════
	 * 7. Render
	 * ════════════════════════════════════════════════════════════════════ */
	return (
		/* backdrop — click outside closes */
		<div
			className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4"
			onPointerDown={(e) => {
				if (e.target === e.currentTarget) onCancel();
			}}
		>
			{/* modal card */}
			<div
				className="relative w-full max-w-md bg-[#16181f] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
				onPointerDown={(e) => e.stopPropagation()}
			>
				{/* ── header ── */}
				<div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8 shrink-0">
					<div>
						<h3 className="text-sm font-semibold text-white">Crop Photo</h3>
						<p className="text-[11px] text-gray-500 mt-0.5">
							Drag to reposition · scroll or pinch to zoom
						</p>
					</div>
					<button
						type="button"
						onClick={onCancel}
						aria-label="Close"
						className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-white/8 transition-colors"
					>
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{/* ── crop canvas ── */}
				<div
					ref={containerRef}
					className={[
						"relative w-full bg-[#0d0f14] overflow-hidden select-none",
						"h-[320px] sm:h-[360px]",
						isDragging ? "cursor-grabbing" : "cursor-grab",
					].join(" ")}
					style={{ touchAction: "none" }}
					onPointerDown={onPointerDown}
					onPointerMove={onPointerMove}
					onPointerUp={onPointerUp}
					onPointerCancel={onPointerUp}
				>
					{/* hidden image — used both for display and as canvas source */}
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						ref={imageRef}
						src={imageSrc}
						alt=""
						draggable={false}
						crossOrigin="anonymous"
						className="absolute pointer-events-none select-none"
						style={{
							width: baseDisplaySize.w || "auto",
							height: baseDisplaySize.h || "auto",
							maxWidth: "none",
							left: "50%",
							top: "50%",
							transform: imgTransform,
							transformOrigin: "center center",
							transition: isDragging ? "none" : "transform 0.06s ease-out",
							opacity: ready ? 1 : 0,
						}}
					/>

					{/* dark overlay with punch-through for crop area */}
					{ready && cropSize.w > 0 && (
						<div className="absolute inset-0 pointer-events-none">
							<svg
								className="absolute inset-0 w-full h-full"
								xmlns="http://www.w3.org/2000/svg"
							>
								<defs>
									<mask id="ic-mask">
										<rect width="100%" height="100%" fill="white" />
										{cropShape === "circle" ? (
											<circle
												cx={cropLeft + cropSize.w / 2}
												cy={cropTop + cropSize.h / 2}
												r={cropSize.w / 2}
												fill="black"
											/>
										) : (
											<rect
												x={cropLeft}
												y={cropTop}
												width={cropSize.w}
												height={cropSize.h}
												rx="6"
												fill="black"
											/>
										)}
									</mask>
								</defs>
								<rect
									width="100%"
									height="100%"
									fill="rgba(0,0,0,0.58)"
									mask="url(#ic-mask)"
								/>
							</svg>

							{/* crop border + rule-of-thirds grid + corner handles */}
							<div
								className={[
									"absolute border border-white/60 overflow-hidden",
									cropShape === "circle" ? "rounded-full" : "rounded-[6px]",
								].join(" ")}
								style={{
									left: cropLeft,
									top: cropTop,
									width: cropSize.w,
									height: cropSize.h,
								}}
							>
								{/* thirds grid — always subtle */}
								<div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
									{Array.from({ length: 9 }).map((_, i) => (
										<div key={i} className="border border-white/[0.12]" />
									))}
								</div>

								{/* corner L-handles */}
								{(
									[
										"top-0 left-0",
										"top-0 right-0",
										"bottom-0 left-0",
										"bottom-0 right-0",
									] as const
								).map((pos, i) => (
									<div
										key={i}
										className={`absolute w-5 h-5 ${pos}`}
										style={{
											borderTop: pos.includes("top")
												? "2.5px solid rgba(255,255,255,0.9)"
												: undefined,
											borderBottom: pos.includes("bottom")
												? "2.5px solid rgba(255,255,255,0.9)"
												: undefined,
											borderLeft: pos.includes("left")
												? "2.5px solid rgba(255,255,255,0.9)"
												: undefined,
											borderRight: pos.includes("right")
												? "2.5px solid rgba(255,255,255,0.9)"
												: undefined,
											borderTopLeftRadius: pos === "top-0 left-0" ? 6 : 0,
											borderTopRightRadius: pos === "top-0 right-0" ? 6 : 0,
											borderBottomLeftRadius: pos === "bottom-0 left-0" ? 6 : 0,
											borderBottomRightRadius:
												pos === "bottom-0 right-0" ? 6 : 0,
										}}
									/>
								))}
							</div>
						</div>
					)}

					{/* loading shimmer */}
					{!ready && (
						<div className="absolute inset-0 flex items-center justify-center">
							<svg
								className="w-6 h-6 text-white/30 animate-spin"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
								/>
							</svg>
						</div>
					)}
				</div>

				{/* ── controls ── */}
				<div className="px-5 py-4 space-y-4 border-t border-white/8 shrink-0">
					{/* zoom row */}
					<div className="flex items-center gap-3">
						{/* − */}
						<button
							type="button"
							onClick={() => applyZoom(zoom - 0.25)}
							disabled={zoom <= MIN_ZOOM}
							aria-label="Zoom out"
							className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-white hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M20 12H4"
								/>
							</svg>
						</button>

						{/* slider */}
						<input
							type="range"
							min={MIN_ZOOM}
							max={MAX_ZOOM}
							step={0.01}
							value={zoom}
							onChange={(e) => applyZoom(parseFloat(e.target.value))}
							className="
                flex-1 h-1.5 rounded-full appearance-none cursor-pointer
                bg-white/10
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-[18px]
                [&::-webkit-slider-thumb]:h-[18px]
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:shadow-sm
                [&::-webkit-slider-thumb]:cursor-grab
                [&::-webkit-slider-thumb]:active:cursor-grabbing
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-110
                [&::-moz-range-thumb]:w-[18px]
                [&::-moz-range-thumb]:h-[18px]
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white
                [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:cursor-grab
              "
						/>

						{/* + */}
						<button
							type="button"
							onClick={() => applyZoom(zoom + 0.25)}
							disabled={zoom >= MAX_ZOOM}
							aria-label="Zoom in"
							className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-white hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 4v16m8-8H4"
								/>
							</svg>
						</button>

						{/* pct label */}
						<span className="text-xs text-gray-600 tabular-nums w-8 text-right">
							{zoomPct}%
						</span>
					</div>

					{/* action row */}
					<div className="flex items-center gap-2">
						{/* rotate */}
						<button
							type="button"
							onClick={handleRotate}
							className="h-9 px-3 flex items-center gap-1.5 rounded-lg border border-white/10 text-xs text-gray-400 hover:text-white hover:border-white/20 transition-colors"
						>
							<svg
								className="w-3.5 h-3.5"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
							Rotate
						</button>

						{/* reset */}
						<button
							type="button"
							onClick={() => {
								setZoom(1);
								const resetOffset = { x: 0, y: 0 };
								setOffset(resetOffset);
								currentOffset.current = resetOffset;
								setRotation(0);
							}}
							className="h-9 px-3 flex items-center gap-1.5 rounded-lg border border-white/10 text-xs text-gray-400 hover:text-white hover:border-white/20 transition-colors"
						>
							<svg
								className="w-3.5 h-3.5"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
							Reset
						</button>

						<div className="flex-1" />

						{/* cancel */}
						<button
							type="button"
							onClick={onCancel}
							className="h-9 px-4 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white transition-colors"
						>
							Cancel
						</button>

						{/* apply */}
						<button
							type="button"
							onClick={handleCrop}
							disabled={!ready}
							className="h-9 px-5 rounded-lg bg-white text-[#0d0f14] text-sm font-semibold hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
						>
							Apply
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
