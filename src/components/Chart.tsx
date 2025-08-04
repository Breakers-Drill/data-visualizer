import React, { useEffect, useRef, useState } from 'react'

export interface DataPoint {
	id: string
	edgeId: number
	tag: string
	timestamp: string
	value: number
	tagsDataId: string | null
}

interface ChartProps {
	data: DataPoint[]
	upperLimit?: number
	lowerLimit?: number
}

const Chart: React.FC<ChartProps> = ({ data, upperLimit, lowerLimit }) => {
	const [dimensions, setDimensions] = useState({ width: 800, height: 500 })
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const updateDimensions = () => {
			if (containerRef.current) {
				const { clientWidth, clientHeight } = containerRef.current
				setDimensions({ width: clientWidth, height: clientHeight })
			}
		}

		updateDimensions()
		window.addEventListener('resize', updateDimensions)
		return () => window.removeEventListener('resize', updateDimensions)
	}, [])

	if (!data || data.length === 0) {
		return <div style={{ color: '#cccccc', padding: '20px' }}>Нет данных для отображения</div>
	}

	// Сортируем данные по времени
	const sortedData = [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

	// Настройки отступов
	const margin = { top: 20, right: 80, bottom: 60, left: 60 }
	const chartWidth = dimensions.width - margin.left - margin.right
	const chartHeight = dimensions.height - margin.top - margin.bottom

	// Находим диапазон данных
	const values = sortedData.map((d) => d.value)
	const minValue = Math.min(...values)
	const maxValue = Math.max(...values)
	const valueRange = maxValue - minValue
	const minY = minValue - valueRange * 0.1
	const maxY = maxValue + valueRange * 0.1

	// Функции масштабирования
	const xScale = (index: number) => (index / (sortedData.length - 1)) * chartWidth
	const yScale = (value: number) => chartHeight - ((value - minY) / (maxY - minY)) * chartHeight

	// Функция для определения, находится ли значение за пределами уставок
	const isOutOfLimits = (value: number): boolean => {
		return (upperLimit !== undefined && value > upperLimit) || (lowerLimit !== undefined && value < lowerLimit)
	}

	// Функция для создания сегментированных путей
	const createSegmentedPaths = () => {
		const bluePaths: string[] = []
		const redPaths: string[] = []

		if (sortedData.length < 2) {
			return { bluePaths, redPaths }
		}

		// Проходим по всем сегментам между точками
		for (let i = 0; i < sortedData.length - 1; i++) {
			const point1 = sortedData[i]
			const point2 = sortedData[i + 1]
			const x1 = xScale(i)
			const y1 = yScale(point1.value)
			const x2 = xScale(i + 1)
			const y2 = yScale(point2.value)

			// Создаем массив точек для текущего сегмента
			const segmentPoints: Array<{ x: number; y: number; value: number }> = [{ x: x1, y: y1, value: point1.value }]

			// Находим все пересечения с уставками на этом сегменте
			const intersections: Array<{ x: number; y: number; value: number }> = []

			if (upperLimit !== undefined) {
				const crosses = (point1.value - upperLimit) * (point2.value - upperLimit) < 0
				if (crosses) {
					const ratio = (upperLimit - point1.value) / (point2.value - point1.value)
					const x = x1 + (x2 - x1) * ratio
					const y = yScale(upperLimit)
					intersections.push({ x, y, value: upperLimit })
				}
			}

			if (lowerLimit !== undefined) {
				const crosses = (point1.value - lowerLimit) * (point2.value - lowerLimit) < 0
				if (crosses) {
					const ratio = (lowerLimit - point1.value) / (point2.value - point1.value)
					const x = x1 + (x2 - x1) * ratio
					const y = yScale(lowerLimit)
					intersections.push({ x, y, value: lowerLimit })
				}
			}

			// Сортируем пересечения по x-координате
			intersections.sort((a, b) => a.x - b.x)

			// Добавляем пересечения к точкам сегмента
			segmentPoints.push(...intersections)
			segmentPoints.push({ x: x2, y: y2, value: point2.value })

			// Создаем саб-сегменты между всеми точками
			for (let j = 0; j < segmentPoints.length - 1; j++) {
				const p1 = segmentPoints[j]
				const p2 = segmentPoints[j + 1]

				// Определяем цвет для средней точки сегмента
				const midValue = (p1.value + p2.value) / 2
				const isRed = isOutOfLimits(midValue)

				const pathSegment = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`

				if (isRed) {
					redPaths.push(pathSegment)
				} else {
					bluePaths.push(pathSegment)
				}
			}
		}

		return { bluePaths, redPaths }
	}

	const { bluePaths, redPaths } = createSegmentedPaths()

	// Создаем отметки для осей
	const xTicks = []
	const yTicks = []

	// X-ось (время)
	const tickCount = Math.min(10, sortedData.length)
	for (let i = 0; i < tickCount; i++) {
		const index = Math.floor((i / (tickCount - 1)) * (sortedData.length - 1))
		const point = sortedData[index]
		const x = xScale(index)
		const time = new Date(point.timestamp).toLocaleTimeString('ru-RU', {
			hour: '2-digit',
			minute: '2-digit',
		})
		xTicks.push({ x, label: time })
	}

	// Y-ось (значения)
	const yTickCount = 8
	for (let i = 0; i <= yTickCount; i++) {
		const value = minY + (maxY - minY) * (i / yTickCount)
		const y = yScale(value)
		yTicks.push({ y, label: Math.round(value * 10) / 10 })
	}

	return (
		<div ref={containerRef} style={{ width: '100%', height: '500px' }}>
			<svg width={dimensions.width} height={dimensions.height}>
				{/* Фон */}
				<rect width={dimensions.width} height={dimensions.height} fill='transparent' />

				{/* Сетка */}
				<g transform={`translate(${margin.left}, ${margin.top})`}>
					{/* Вертикальные линии сетки */}
					{xTicks.map((tick, i) => (
						<line
							key={`v-grid-${i}`}
							x1={tick.x}
							y1={0}
							x2={tick.x}
							y2={chartHeight}
							stroke='#404040'
							strokeDasharray='3 3'
							strokeWidth={1}
						/>
					))}

					{/* Горизонтальные линии сетки */}
					{yTicks.map((tick, i) => (
						<line
							key={`h-grid-${i}`}
							x1={0}
							y1={tick.y}
							x2={chartWidth}
							y2={tick.y}
							stroke='#404040'
							strokeDasharray='3 3'
							strokeWidth={1}
						/>
					))}
				</g>

				{/* Область графика */}
				<g transform={`translate(${margin.left}, ${margin.top})`}>
					{/* Синие сегменты линии */}
					{bluePaths.map((path, i) => (
						<path key={`blue-${i}`} d={path} stroke='#2196F3' strokeWidth={2} fill='none' />
					))}

					{/* Красные сегменты линии */}
					{redPaths.map((path, i) => (
						<path key={`red-${i}`} d={path} stroke='#f44336' strokeWidth={2} fill='none' />
					))}

					{/* Линии уставок */}
					{upperLimit !== undefined && (
						<line
							x1={0}
							y1={yScale(upperLimit)}
							x2={chartWidth}
							y2={yScale(upperLimit)}
							stroke='#ff9800'
							strokeDasharray='5 5'
							strokeWidth={2}
						/>
					)}

					{lowerLimit !== undefined && (
						<line
							x1={0}
							y1={yScale(lowerLimit)}
							x2={chartWidth}
							y2={yScale(lowerLimit)}
							stroke='#ff9800'
							strokeDasharray='5 5'
							strokeWidth={2}
						/>
					)}

					{/* Точки данных */}
					{sortedData.map((point, i) => (
						<circle
							key={`point-${i}`}
							cx={xScale(i)}
							cy={yScale(point.value)}
							r={4}
							fill={isOutOfLimits(point.value) ? '#f44336' : '#2196F3'}
							stroke='#ffffff'
							strokeWidth={2}
						/>
					))}
				</g>

				{/* Оси */}
				{/* X-ось */}
				<g transform={`translate(${margin.left}, ${margin.top + chartHeight})`}>
					<line x1={0} y1={0} x2={chartWidth} y2={0} stroke='#cccccc' strokeWidth={1} />
					{xTicks.map((tick, i) => (
						<g key={`x-tick-${i}`}>
							<line x1={tick.x} y1={0} x2={tick.x} y2={5} stroke='#cccccc' strokeWidth={1} />
							<text x={tick.x} y={20} textAnchor='middle' fill='#cccccc' fontSize='12'>
								{tick.label}
							</text>
						</g>
					))}
				</g>

				{/* Y-ось */}
				<g transform={`translate(${margin.left}, ${margin.top})`}>
					<line x1={0} y1={0} x2={0} y2={chartHeight} stroke='#cccccc' strokeWidth={1} />
					{yTicks.map((tick, i) => (
						<g key={`y-tick-${i}`}>
							<line x1={0} y1={tick.y} x2={-5} y2={tick.y} stroke='#cccccc' strokeWidth={1} />
							<text x={-10} y={tick.y + 4} textAnchor='end' fill='#cccccc' fontSize='12'>
								{tick.label}
							</text>
						</g>
					))}
				</g>

				{/* Подписи уставок */}
				{upperLimit !== undefined && (
					<text x={margin.left + chartWidth + 10} y={margin.top + yScale(upperLimit) + 4} fill='#ff9800' fontSize='12'>
						Верх: {upperLimit}
					</text>
				)}

				{lowerLimit !== undefined && (
					<text x={margin.left + chartWidth + 10} y={margin.top + yScale(lowerLimit) + 4} fill='#ff9800' fontSize='12'>
						Ниж: {lowerLimit}
					</text>
				)}
			</svg>
		</div>
	)
}

export default Chart
