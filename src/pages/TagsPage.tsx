// @ts-nocheck
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

declare global {
	namespace JSX {
		interface IntrinsicElements {
			[elemName: string]: any
		}
	}
}

type TagItem = {
	id: number
	tag: string
	name: string
	type: string
	minValue: number | null
	maxValue: number | null
	multiplier: number | null
	comment: string | null
}

export default function TagsPage() {
	const [tags, setTags] = useState<TagItem[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)
	const [query, setQuery] = useState<string>('')
	const navigate = useNavigate()

	const [file, setFile] = useState<File | null>(null)
	const [uploading, setUploading] = useState<boolean>(false)
	const [uploadError, setUploadError] = useState<string | null>(null)
	const [added, setAdded] = useState<TagItem[] | null>(null)

	useEffect(() => {
		const controller = new AbortController()
		const load = async () => {
			setLoading(true)
			setError(null)
			try {
				const base = import.meta.env.VITE_API_URL
				const { data } = await axios.get<TagItem[]>(`${base}/tags-data`, {
					signal: controller.signal,
				})
				setTags(Array.isArray(data) ? data : [])
			} catch (e: unknown) {
				if (axios.isCancel(e)) return
				const message = e instanceof Error ? e.message : 'Ошибка загрузки'
				setError(message)
			} finally {
				setLoading(false)
			}
		}
		load()
		return () => controller.abort()
	}, [])

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase()
		if (!q) return tags
		return tags.filter((t) =>
			[t.tag, t.name, t.type, t.comment]
				.filter(Boolean)
				.some((v) => String(v).toLowerCase().includes(q))
		)
	}, [tags, query])

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const selected = e.target.files && e.target.files[0] ? e.target.files[0] : null
		setFile(selected)
	}

	const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value)
	}

	const handleImportSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!file) return
		setUploading(true)
		setUploadError(null)
		setAdded(null)
		try {
			const base = import.meta.env.VITE_API_URL
			const formData = new FormData()
			formData.append('file', file)
			const infraKey = import.meta.env.VITE_INFRA_SECRET_KEY
			const { data } = await axios.post<TagItem[]>(`${base}/tags-data/import/excel`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					...(infraKey ? { Authorization: `Bearer ${infraKey}` } : {}),
				},
			})
			if (Array.isArray(data)) {
				const existing = new Set(tags.map((t) => t.tag))
				const onlyNew = data.filter((t) => !existing.has(t.tag))
				setAdded(onlyNew)
				setTags((prev) => [...onlyNew, ...prev])
			}
			setFile(null)
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Ошибка импорта'
			setUploadError(message)
		} finally {
			setUploading(false)
		}
	}

	return (
		<div style={{ padding: 16 }}>
			<h2 style={{ margin: '8px 0 16px' }}>Теги</h2>
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
				<button
					onClick={() => navigate(-1)}
					style={{
						padding: '8px 10px',
						border: '1px solid #dee2e6',
						background: '#fff',
						borderRadius: 6,
						cursor: 'pointer',
					}}
				>
					← Назад
				</button>
				<form onSubmit={handleImportSubmit} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<input
						type="file"
						accept=".xlsx,.xls"
						onChange={handleFileChange}
					/>
					<button
						type="submit"
						disabled={!file || uploading}
						style={{
							padding: '8px 12px',
							background: uploading ? '#adb5bd' : '#0d6efd',
							color: '#fff',
							border: 'none',
							borderRadius: 6,
							cursor: uploading ? 'not-allowed' : 'pointer',
						}}
					>
						{uploading ? 'Импорт...' : 'Импорт Excel'}
					</button>
				</form>
			</div>

			{uploadError && (
				<div style={{ color: '#dc3545', marginBottom: 8 }}>Ошибка импорта: {uploadError}</div>
			)}
			{added && added.length > 0 && (
				<div style={{
					border: '1px solid #c3e6cb',
					background: '#d4edda',
					color: '#155724',
					padding: 10,
					borderRadius: 6,
					marginBottom: 12,
				}}>
					<b>Добавлено тегов:</b> {added.length}
					<ul style={{ margin: '8px 0 0 18px' }}>
						{added.map((t) => (
							<li key={`added-${t.id}`}>
								<code>{t.tag}</code>{t.name ? ` — ${t.name}` : ''}
							</li>
						))}
					</ul>
				</div>
			)}

			<div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
				<input
					type="text"
					placeholder="Поиск по тегу, названию или типу"
					value={query}
					onChange={handleQueryChange}
					style={{
						width: 360,
						padding: '8px 10px',
						border: '1px solid #dee2e6',
						borderRadius: 6,
					}}
				/>
				<div style={{ color: '#6c757d' }}>Найдено: {filtered.length}</div>
			</div>

			{loading && <div>Загрузка...</div>}
			{error && (
				<div style={{ color: '#dc3545', marginBottom: 12 }}>Ошибка: {error}</div>
			)}

			{!loading && !error && (
				<div style={{ overflowX: 'auto' }}>
					<table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 900 }}>
						<thead>
							<tr>
								<th style={thStyle}>ID</th>
								<th style={thStyle}>Тег</th>
								<th style={thStyle}>Наименование</th>
								<th style={thStyle}>Ед.изм.</th>
								<th style={thStyle}>Уставка нижняя</th>
								<th style={thStyle}>Уставка верхняя</th>
								<th style={thStyle}>Множитель</th>
								<th style={thStyle}>Комментарий</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((t) => (
								<tr key={t.id}>
									<td style={tdStyle}>{t.id}</td>
									<td style={tdStyle}><code>{t.tag}</code></td>
									<td style={tdStyle}>{t.name}</td>
									<td style={tdStyle}>{t.type}</td>
									<td style={tdStyle}>{t.minValue ?? ''}</td>
									<td style={tdStyle}>{t.maxValue ?? ''}</td>
									<td style={tdStyle}>{t.multiplier ?? ''}</td>
									<td style={{ ...tdStyle, maxWidth: 360, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={t.comment ?? ''}>
										{t.comment}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}

const thStyle: CSSProperties = {
	textAlign: 'left',
	padding: '10px 12px',
	borderBottom: '1px solid #e9ecef',
	background: '#f8f9fa',
}

const tdStyle: CSSProperties = {
	textAlign: 'left',
	padding: '10px 12px',
	borderBottom: '1px solid #f1f3f5',
}

