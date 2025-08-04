import axios from 'axios'
import { useEffect, useState } from 'react'
import './App.css'
import Chart, { type DataPoint } from './components/Chart'

function App() {
	const [upperLimit, setUpperLimit] = useState<number>(42)
	const [lowerLimit, setLowerLimit] = useState<number>(18)
	const [startDate, setStartDate] = useState<string>('2025-08-01T17:30:00')
	const [endDate, setEndDate] = useState<string>('2025-08-02T19:34:00')
	const [interval, setInterval] = useState<string>('1min')
	const [sensorTag, setSensorTag] = useState<string>('DC_out_100ms[148]')
	const [chartData, setChartData] = useState<DataPoint[] | null>(null)

	// Функция для получения интервала в миллисекундах
	const getIntervalMs = (intervalString: string): number => {
		switch (intervalString) {
			case '1 минута':
				return 60 * 1000
			case '5 минут':
				return 5 * 60 * 1000
			case '10 минут':
				return 10 * 60 * 1000
			case '30 минут':
				return 30 * 60 * 1000
			case '1 час':
				return 60 * 60 * 1000
			default:
				return 60 * 1000
		}
	}

	useEffect(() => {
		console.log(startDate, endDate, interval, sensorTag)
		axios
			.post(`${import.meta.env.VITE_API_URL}/sensor-data`, {
				tag: sensorTag,
				dateInterval: {
					start: new Date(startDate).toISOString(),
					end: new Date(endDate).toISOString(),
				},
				interval,
			})
			.then((res) => {
				setChartData(res.data)
			})
	}, [interval, startDate, endDate, sensorTag])

	if (!chartData) return <></>

	// Фильтруем данные по выбранному диапазону дат
	const dateFilteredData = chartData.filter((item) => {
		const itemDate = new Date(item.timestamp)
		const start = new Date(startDate)
		const end = new Date(endDate)
		return itemDate >= start && itemDate <= end
	})

	// Применяем фильтрацию по интервалу
	const filteredData = (() => {
		if (dateFilteredData.length === 0) return []

		const intervalMs = getIntervalMs(interval)
		const result = [dateFilteredData[0]] // Всегда включаем первую точку

		let lastIncludedTime = new Date(dateFilteredData[0].timestamp).getTime()

		for (let i = 1; i < dateFilteredData.length; i++) {
			const currentTime = new Date(dateFilteredData[i].timestamp).getTime()

			// Если прошло достаточно времени или это последняя точка
			if (currentTime - lastIncludedTime >= intervalMs || i === dateFilteredData.length - 1) {
				result.push(dateFilteredData[i])
				lastIncludedTime = currentTime
			}
		}

		return result
	})()

	return (
		<div className='App'>
			{/* Верхняя панель с элементами управления */}
			<div className='control-panel'>
				<div className='control-group'>
					<label className='control-label'>Тег сенсора:</label>
					<input
						type='text'
						value={sensorTag}
						onChange={(e) => setSensorTag(e.target.value)}
						className='control-input'
					/>
				</div>

				<div className='control-group'>
					<label className='control-label'>Начальная дата:</label>
					<input
						type='datetime-local'
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						className='control-input'
					/>
				</div>

				<div className='control-group'>
					<label className='control-label'>Конечная дата:</label>
					<input
						type='datetime-local'
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						className='control-input'
					/>
				</div>

				<div className='control-group'>
					<label className='control-label'>Интервал:</label>
					<select value={interval} onChange={(e) => setInterval(e.target.value)} className='control-input'>
						<option value='1min'>1 минута</option>
						<option value='5min'>5 минут</option>
						<option value='10min'>10 минут</option>
						<option value='30min'>30 минут</option>
						<option value='1h'>1 час</option>
					</select>
				</div>
			</div>

			{/* Панель с графиком */}
			<div className='chart-panel'>
				<div className='chart-header'>
					<h2 className='chart-title'>График данных сенсора</h2>
					<div className='chart-info'>
						Тег: {sensorTag} | Количество точек: {filteredData.length}
					</div>
				</div>

				<div className='limits-controls'>
					<div className='limit-group'>
						<label className='limit-label'>Верхняя уставка:</label>
						<input
							type='number'
							value={upperLimit}
							onChange={(e) => setUpperLimit(Number(e.target.value))}
							className='limit-input'
						/>
					</div>

					<div className='limit-group'>
						<label className='limit-label'>Нижняя уставка:</label>
						<input
							type='number'
							value={lowerLimit}
							onChange={(e) => setLowerLimit(Number(e.target.value))}
							className='limit-input'
						/>
					</div>
				</div>

				<Chart data={filteredData} upperLimit={upperLimit} lowerLimit={lowerLimit} />
			</div>
		</div>
	)
}

export default App
