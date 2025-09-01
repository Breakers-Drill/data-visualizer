import { useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import drillSvg from "../assets/drill.svg";
import { getRigById } from "../api/rigs";
import { useEdgeWithAttributes } from "../hooks/useEdges";
import { useEdgeBlocks } from "../hooks/useBlocks";
import EdgeStatusPanel from "../components/EdgeStatusPanel";
import type { Rig } from "../types/rig";


// Сегменты заданы в процентах относительно размера изображения (viewBox 1010x1024)
// Координаты подобраны под видимые контуры на картинке
const SEGMENTS: { id: string; name: string; href: string; polygon: string }[] = [
	// Блок 1 — самый левый контейнер
	{ id: "1", name: "КТУ/КРУ", href: "/charts/separate", polygon: "3.4% 84.5%, 24.3% 80.9%, 33% 83.2%, 33.2% 90.2%, 11.3% 95.5%, 3.5% 91.9%" },
	// Блок 2 — средний контейнер
	{ id: "2", name: "Насосный блок", href: "/charts/separate", polygon: "26% 80.6%, 42.4% 77.6%, 51.5% 79.3%, 51.6% 85.5%, 34.9% 89.6%, 34.8% 82.8%" },
	// Блок 3 — правый малый контейнер
	{ id: "3", name: "Циркуляционная система", href: "/charts/separate", polygon: "43.8% 77.4%, 57% 75%, 66.3% 76.4%, 66.3% 81.9%, 53.1% 85.1%, 52.9% 79.1%" },
	// Блок 4 — площадка у основания вышки
	{ id: "4", name: "Лебедочный блок", href: "/charts/separate", polygon: "58.5% 70%, 60.5% 58.5%, 70.5% 58.7%, 75.2% 58.3%, 78% 70%, 70% 71.5%"},
];

function polygonPercentToSvgPoints(polygon: string): string {
	return polygon
		.split("/")
		.join("") // на случай символов
		.split(",")
		.map((pair) => {
			const [xStr, yStr] = pair.trim().split(/\s+/);
			const x = parseFloat(xStr.replace("%", "")) || 0;
			const y = parseFloat(yStr.replace("%", "")) || 0;
			return `${x},${y}`;
		})
		.join(" ");
}

export default function MainPage() {
	const params = useParams();
	const navigate = useNavigate();
	const rigId = params.rigId || "14820";
	const [rig, setRig] = useState<Rig | null>(null);
	const [hovered, setHovered] = useState<string | null>(null);

	// Используем rigId как edge_key для получения данных
	const edgeKey = `d_${rigId}`;
	const { edgeData, loading: edgeLoading, error: edgeError } = useEdgeWithAttributes(edgeKey);
	const { blocks, loading: blocksLoading } = useEdgeBlocks(edgeKey);

	useEffect(() => {
		getRigById(rigId).then((r) => setRig(r ?? null));
	}, [rigId]);

	// Используем название из edge данных, если доступно, иначе fallback на rig или rigId
	const rigName = useMemo(() => {
		if (edgeData?.name) return edgeData.name;
		if (rig?.name) return rig.name;
		return `БУ №${rigId}`;
	}, [edgeData, rig, rigId]);

	return (
		<div className="main-page">
			<div className="main-hero">
				<h2>{rigName}</h2>
			</div>

			<div className="rig-stage">
				<img src={drillSvg} alt="Буровая установка" className="rig-base" />

				{blocksLoading ? (
					<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '8px' }}>
						Загрузка блоков...
					</div>
				) : blocks.length > 0 ? (
					blocks.map((block, index) => {
						// Используем статические полигоны для позиционирования, но данные из API
						const segment = SEGMENTS[index] || SEGMENTS[SEGMENTS.length - 1];
						const points = polygonPercentToSvgPoints(segment.polygon);
						return (
							<button
								key={block.block_name}
								className={`rig-segment${hovered === block.block_name ? " is-hovered" : ""}`}
								style={{ clipPath: `polygon(${segment.polygon})` }}
								data-seg={block.block_name}
								aria-label={block.description || block.block_name}
								title={`${block.block_name} — ${block.description || block.block_name}`}
								onMouseEnter={() => setHovered(block.block_name)}
								onMouseLeave={() => setHovered(null)}
								onFocus={() => setHovered(block.block_name)}
								onBlur={() => setHovered(null)}
								onClick={() => navigate(`/charts?mode=separate&rig=${rigId}&block=${block.block_name}`)}
							>
								<img src={drillSvg} alt="" aria-hidden className="seg-img" />
								<svg className="seg-border" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
									<polygon points={points} />
								</svg>
								<span className="seg-badge">{index + 1}</span>
							</button>
						);
					})
				) : (
					// Fallback на статические сегменты если нет данных из API
					SEGMENTS.map((s) => {
						const points = polygonPercentToSvgPoints(s.polygon);
						return (
							<button
								key={s.id}
								className={`rig-segment${hovered === s.id ? " is-hovered" : ""}`}
								style={{ clipPath: `polygon(${s.polygon})` }}
								data-seg={s.id}
								aria-label={`${s.name}`}
								title={`${s.id} — ${s.name}`}
								onMouseEnter={() => setHovered(s.id)}
								onMouseLeave={() => setHovered(null)}
								onFocus={() => setHovered(s.id)}
								onBlur={() => setHovered(null)}
								onClick={() => navigate(`/charts?mode=separate&rig=${rigId}&block=${s.id}`)}
							>
								<img src={drillSvg} alt="" aria-hidden className="seg-img" />
								<svg className="seg-border" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
									<polygon points={points} />
								</svg>
								<span className="seg-badge">{s.id}</span>
							</button>
						);
					})
				)}
			</div>

			<div className="seg-legend">
				{blocksLoading ? (
					<div style={{ textAlign: 'center', padding: '20px' }}>Загрузка блоков...</div>
				) : blocks.length > 0 ? (
					blocks.map((block, index) => (
						<button
							key={block.block_name}
							className="seg-item"
							onMouseEnter={() => setHovered(block.block_name)}
							onMouseLeave={() => setHovered(null)}
							onFocus={() => setHovered(block.block_name)}
							onBlur={() => setHovered(null)}
							onClick={() => navigate(`/charts?mode=separate&rig=${rigId}&block=${block.block_name}`)}
						>
							<span className="seg-dot">{index + 1}</span>
							{block.description || block.block_name}
						</button>
					))
				) : (
					// Fallback на статические сегменты
					SEGMENTS.map((s) => (
						<button
							key={s.id}
							className="seg-item"
							onMouseEnter={() => setHovered(s.id)}
							onMouseLeave={() => setHovered(null)}
							onFocus={() => setHovered(s.id)}
							onBlur={() => setHovered(null)}
							onClick={() => navigate(`/charts?mode=separate&rig=${rigId}&block=${s.id}`)}
						>
							<span className="seg-dot">{s.id}</span>
							{s.name}
						</button>
					))
				)}
			</div>

			{/* Панель статусов edge */}
			<div className="edge-status-section">
				{edgeError && (
					<div className="edge-error">
						Ошибка загрузки данных: {edgeError}
					</div>
				)}
				<EdgeStatusPanel 
					attributes={edgeData?.attributes || null} 
					loading={edgeLoading} 
				/>
			</div>
		</div>
	);
}
