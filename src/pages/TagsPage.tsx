import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { tagsApi, type TagItem } from '../api/tags'
import EditableTagRow from '../components/EditableTagRow'
import AddTagForm from '../components/AddTagForm'

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
	
	// Состояния для редактирования
	const [editingId, setEditingId] = useState<number | null>(null)
	const [showAddForm, setShowAddForm] = useState(false)

	useEffect(() => {
		const load = async () => {
			setLoading(true)
			setError(null)
			
			try {
				// Загружаем теги
				const data = await tagsApi.getAllTags()
				setTags(data)
				
			} catch (e: unknown) {
				const message = e instanceof Error ? e.message : 'Ошибка загрузки'
				setError(message)
			} finally {
				setLoading(false)
			}
		}
		load()
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
			const data = await tagsApi.importExcel(file)
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

	// Функции для редактирования
	const handleEdit = (id: number) => {
		setEditingId(id)
	}

	const handleCancelEdit = () => {
		setEditingId(null)
	}

	const handleSaveEdit = async (updatedTag: TagItem) => {
		try {
			const savedTag = await tagsApi.updateTag(updatedTag.id, updatedTag)
			setTags(prev => prev.map(t => t.id === savedTag.id ? savedTag : t))
			setEditingId(null)
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Ошибка обновления'
			setError(message)
		}
	}

	const handleDelete = async (id: number) => {
		if (!confirm('Вы уверены, что хотите удалить этот тег?')) return
		
		try {
			await tagsApi.deleteTag(id)
			setTags(prev => prev.filter(t => t.id !== id))
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Ошибка удаления'
			setError(message)
		}
	}

	// Функции для добавления
	const handleAddTag = async (tagData: Omit<TagItem, 'id'>) => {
		try {
			const newTag = await tagsApi.createTag(tagData)
			setTags(prev => [newTag, ...prev])
			setShowAddForm(false)
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Ошибка создания'
			setError(message)
		}
	}

	const handleCancelAdd = () => {
		setShowAddForm(false)
	}

	return (
		<div style={{ padding: 16 }}>
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
				<h2 style={{ margin: '0' }}>Теги</h2>
			</div>
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
				<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
					<button
						onClick={() => setShowAddForm(!showAddForm)}
						style={{
							padding: '8px 12px',
							background: showAddForm ? '#6c757d' : '#198754',
							color: '#fff',
							border: 'none',
							borderRadius: 6,
							cursor: 'pointer',
						}}
					>
						{showAddForm ? 'Отмена' : '+ Добавить тег'}
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

			{showAddForm && (
				<AddTagForm onAdd={handleAddTag} onCancel={handleCancelAdd} />
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
					<table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1000 }}>
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
								<th style={thStyle}>Действия</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((t) => (
								<EditableTagRow
									key={t.id}
									tag={t}
									isEditing={editingId === t.id}
									onSave={handleSaveEdit}
									onCancel={handleCancelEdit}
									onEdit={() => handleEdit(t.id)}
									onDelete={() => handleDelete(t.id)}
								/>
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



