import axios from 'axios'
import { useEffect, useState } from 'react'
import './App.css'
import Chart, { type DataPoint } from './components/Chart'
import mockTags from './mockTags.json'
import mockData from './mockData.json'

function App() {
	const [upperLimit, setUpperLimit] = useState<number>(42)
	const [lowerLimit, setLowerLimit] = useState<number>(18)
	const [startDate, setStartDate] = useState<string>('2025-08-01T17:30:00')
	const [endDate, setEndDate] = useState<string>('2025-08-02T19:34:00')
	const [interval, setInterval] = useState<string>('1min')
	const [selectedTags, setSelectedTags] = useState<string[]>(['DC_out_100ms[148]'])
	const [chartsData, setChartsData] = useState<{ [tag: string]: DataPoint[] }>({})
	const [dropdownOpen, setDropdownOpen] = useState<boolean>(false)
	
	// Закрытие дропдауна при клике вне его
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element
			if (!target.closest('.custom-multi-select')) {
				setDropdownOpen(false)
			}
		}
		
		if (dropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}
		
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [dropdownOpen])

	// Функция для получения интервала в миллисекундах
	const getIntervalMs = (intervalString: string): number => {
		switch (intervalString) {
			case '1min':
				return 60 * 1000
			case '5min':
				return 5 * 60 * 1000
			case '10min':
				return 10 * 60 * 1000
			case '30min':
				return 30 * 60 * 1000
			case '1h':
				return 60 * 60 * 1000
			default:
				return 60 * 1000
		}
	}

	useEffect(() => {
		const fetchDataForAllTags = async () => {
			const newChartsData: { [tag: string]: DataPoint[] } = {}
			
			for (const tag of selectedTags) {
				try {
					console.log('Fetching data for tag:', tag)
					
					// Для DC_out_100ms[148] используем реальный API, для остальных - моковые данные
					if (tag === 'DC_out_100ms[148]') {
						const response = await axios.post(`${import.meta.env.VITE_API_URL}/sensor-data`, {
							tag,
							dateInterval: {
								start: new Date(startDate).toISOString(),
								end: new Date(endDate).toISOString(),
							},
							interval,
						})
						newChartsData[tag] = response.data
					} else {
						// Используем моковые данные для остальных тегов
						const mockTagData = mockData[tag as keyof typeof mockData]
						if (mockTagData) {
							// Фильтруем моковые данные по выбранному диапазону дат
							const filteredMockData = mockTagData.filter((item) => {
								const itemDate = new Date(item.timestamp)
								const start = new Date(startDate)
								const end = new Date(endDate)
								return itemDate >= start && itemDate <= end
							})
							newChartsData[tag] = filteredMockData
						} else {
							newChartsData[tag] = []
						}
					}
				} catch (error) {
					console.error(`Ошибка загрузки данных для тега ${tag}:`, error)
					newChartsData[tag] = []
				}
			}
			
			setChartsData(newChartsData)
		}
		
		fetchDataForAllTags()
	}, [interval, startDate, endDate, selectedTags])

	if (Object.keys(chartsData).length === 0) return <></>

	// Обрабатываем данные для каждого тега
	const processedChartsData = Object.keys(chartsData).reduce((acc, tag) => {
		const chartData = chartsData[tag]
		
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
		
		acc[tag] = filteredData
		return acc
	}, {} as { [tag: string]: DataPoint[] })

	return (
		<div className='App'>
			{/* Верхняя панель с элементами управления */}
			<div className='control-panel'>
				<div className='control-group'>
					<label className='control-label'>Теги сенсоров:</label>
					<div className='custom-multi-select'>
						<div className='select-input-container'>
							<div className='selected-tags-display'>
								{selectedTags.map(tag => (
									<span key={tag} className='tag-chip'>
										<span title={tag}>{tag}</span>
										<button 
											onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
											className='tag-remove'
										>
											×
										</button>
									</span>
								))}
							</div>
							<button 
								className='select-dropdown-button'
								onClick={() => setDropdownOpen(!dropdownOpen)}
							>
								▼
							</button>
						</div>
						{dropdownOpen && (
							<div className='select-dropdown'>
								{mockTags.map(tag => (
									<div 
										key={tag} 
										className={`dropdown-option ${selectedTags.includes(tag) ? 'selected' : ''}`}
										onClick={() => {
											if (selectedTags.includes(tag)) {
												setSelectedTags(selectedTags.filter(t => t !== tag))
											} else {
												setSelectedTags([...selectedTags, tag])
											}
										}}
									>
										{selectedTags.includes(tag) && <span className='checkmark'>✓</span>}
										{tag}
									</div>
								))}
							</div>
						)}
					</div>
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
						Выбрано графиков: {selectedTags.length}
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

				{/* Отображаем графики для каждого выбранного тега */}
				<div className='charts-container'>
					{selectedTags.map((tag, index) => {
						const isLastChart = index === selectedTags.length - 1
						const data = processedChartsData[tag] || []
						return (
							<div key={tag} className='chart-wrapper'>
								<div className='chart-title-small'>
									{tag} ({data.length} точек)
								</div>
								<Chart 
									data={data} 
									upperLimit={upperLimit} 
									lowerLimit={lowerLimit}
									showXAxis={isLastChart}
									height={300}
								/>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}

export default App
