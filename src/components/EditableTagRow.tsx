import React, { useState, type CSSProperties } from 'react'
import { type TagItem } from '../api/tags'

const VALID_TYPES = ['bool', 'об/мин', 'бар', '°C', 'л/с', 'мм/с', 'Н·м', 'град', 'л', '%']

interface EditableTagRowProps {
  tag: TagItem
  isEditing: boolean
  onSave: (updatedTag: TagItem) => Promise<void>
  onCancel: () => void
  onEdit: () => void
  onDelete: () => Promise<void>
}

export const EditableTagRow: React.FC<EditableTagRowProps> = ({
  tag,
  isEditing,
  onSave,
  onCancel,
  onEdit,
  onDelete,
}) => {
  const [editData, setEditData] = useState<TagItem>(tag)
  const [saving, setSaving] = useState(false)

  const validateData = (): string | null => {
    if (!editData.tag.trim()) return 'Поле "Тег" обязательно'
    if (!editData.name.trim()) return 'Поле "Название" обязательно'
    if (!editData.type) return 'Выберите тип'
    if (editData.minValue >= editData.maxValue) return 'Мин. значение должно быть меньше макс.'
    if (editData.multiplier <= 0) return 'Множитель должен быть больше 0'
    return null
  }

  const handleSave = async () => {
    const validationError = validateData()
    if (validationError) {
      alert(validationError)
      return
    }

    try {
      setSaving(true)
      await onSave(editData)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData(tag) // Сбросить к исходным данным
    onCancel()
  }

  if (isEditing) {
    return (
      <tr style={{ backgroundColor: '#fff3cd' }}>
        <td style={tdStyle}>{tag.id}</td>
        <td style={tdStyle}>
          <input
            type="text"
            value={editData.tag}
            onChange={(e) => setEditData(prev => ({ ...prev, tag: e.target.value }))}
            style={inputStyle}
            placeholder="dc_out_300ms[0]"
          />
        </td>
        <td style={tdStyle}>
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
            style={inputStyle}
            placeholder="Название тега"
          />
        </td>
        <td style={tdStyle}>
          <select
            value={editData.type}
            onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value }))}
            style={inputStyle}
          >
            <option value="">Выберите тип</option>
            {VALID_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </td>
        <td style={tdStyle}>
          <input
            type="number"
            value={editData.minValue}
            onChange={(e) => setEditData(prev => ({ ...prev, minValue: Number(e.target.value) }))}
            style={inputStyle}
            placeholder="0"
          />
        </td>
        <td style={tdStyle}>
          <input
            type="number"
            value={editData.maxValue}
            onChange={(e) => setEditData(prev => ({ ...prev, maxValue: Number(e.target.value) }))}
            style={inputStyle}
            placeholder="100"
          />
        </td>
        <td style={tdStyle}>
          <input
            type="number"
            step="0.1"
            value={editData.multiplier}
            onChange={(e) => setEditData(prev => ({ ...prev, multiplier: Number(e.target.value) }))}
            style={inputStyle}
            placeholder="1"
          />
        </td>
        <td style={tdStyle}>
          <input
            type="text"
            value={editData.comment}
            onChange={(e) => setEditData(prev => ({ ...prev, comment: e.target.value }))}
            style={{ ...inputStyle, maxWidth: 200 }}
            placeholder="Комментарий"
          />
        </td>
        <td style={tdStyle}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                ...buttonStyle,
                backgroundColor: saving ? '#adb5bd' : '#198754',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? '...' : '✓'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              style={{
                ...buttonStyle,
                backgroundColor: '#6c757d',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td style={tdStyle}>{tag.id}</td>
      <td style={tdStyle}><code>{tag.tag}</code></td>
      <td style={tdStyle}>{tag.name}</td>
      <td style={tdStyle}>{tag.type}</td>
      <td style={tdStyle}>{tag.minValue}</td>
      <td style={tdStyle}>{tag.maxValue}</td>
      <td style={tdStyle}>{tag.multiplier}</td>
      <td style={{ ...tdStyle, maxWidth: 360, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={tag.comment}>
        {tag.comment}
      </td>
      <td style={tdStyle}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={onEdit}
            style={{
              ...buttonStyle,
              backgroundColor: '#6c757d'
            }}
          >
            ✏
          </button>
          <button
            onClick={onDelete}
            style={{
              ...buttonStyle,
              backgroundColor: '#6c757d'
            }}
          >
            ×
          </button>
        </div>
      </td>
    </tr>
  )
}

const tdStyle: CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  borderBottom: '1px solid #f1f3f5',
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '4px 8px',
  border: '1px solid #dee2e6',
  borderRadius: 4,
  fontSize: '14px',
}

const buttonStyle: CSSProperties = {
  border: 'none',
  borderRadius: 4,
  padding: '4px 8px',
  color: 'white',
  cursor: 'pointer',
  fontSize: '12px',
  minWidth: '24px',
}

export default EditableTagRow
