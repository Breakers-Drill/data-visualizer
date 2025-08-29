import React, { useState, type CSSProperties } from 'react'
import { type TagItem } from '../api/tags'

const VALID_TYPES = ['bool', 'об/мин', 'бар', '°C', 'л/с', 'мм/с', 'Н·м', 'град', 'л', '%']

interface AddTagFormProps {
  onAdd: (tagData: Omit<TagItem, 'id'>) => Promise<void>
  onCancel: () => void
}

export const AddTagForm: React.FC<AddTagFormProps> = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState<Omit<TagItem, 'id'>>({
    tag: '',
    name: '',
    type: '',
    minValue: 0,
    maxValue: 100,
    multiplier: 1,
    comment: ''
  })
  const [saving, setSaving] = useState(false)

  const validateForm = (): string | null => {
    if (!formData.tag.trim()) return 'Поле "Тег" обязательно для заполнения'
    if (!formData.name.trim()) return 'Поле "Название" обязательно для заполнения'
    if (!formData.type) return 'Выберите тип из списка'
    if (formData.minValue >= formData.maxValue) return 'Минимальное значение должно быть меньше максимального'
    if (formData.multiplier <= 0) return 'Множитель должен быть больше 0'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      alert(validationError)
      return
    }

    try {
      setSaving(true)
      await onAdd(formData)
      // Сбросить форму после успешного добавления
      setFormData({
        tag: '',
        name: '',
        type: '',
        minValue: 0,
        maxValue: 100,
        multiplier: 1,
        comment: ''
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={containerStyle}>
      <h3 style={{ margin: '0 0 16px 0' }}>Добавить новый тег</h3>
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>
            Тег *
            <input
              type="text"
              value={formData.tag}
              onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
              style={inputStyle}
              placeholder="dc_out_300ms[999]"
              required
            />
          </label>
          
          <label style={labelStyle}>
            Название *
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              style={inputStyle}
              placeholder="Описание тега"
              required
            />
          </label>
          
          <label style={labelStyle}>
            Тип *
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              style={inputStyle}
              required
            >
              <option value="">Выберите тип</option>
              {VALID_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>
            Мин. значение
            <input
              type="number"
              value={formData.minValue}
              onChange={(e) => setFormData(prev => ({ ...prev, minValue: Number(e.target.value) }))}
              style={inputStyle}
              placeholder="0"
            />
          </label>
          
          <label style={labelStyle}>
            Макс. значение
            <input
              type="number"
              value={formData.maxValue}
              onChange={(e) => setFormData(prev => ({ ...prev, maxValue: Number(e.target.value) }))}
              style={inputStyle}
              placeholder="100"
            />
          </label>
          
          <label style={labelStyle}>
            Множитель
            <input
              type="number"
              step="0.1"
              value={formData.multiplier}
              onChange={(e) => setFormData(prev => ({ ...prev, multiplier: Number(e.target.value) }))}
              style={inputStyle}
              placeholder="1"
            />
          </label>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>
            Комментарий
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
              placeholder="Дополнительная информация о теге"
            />
          </label>
        </div>

        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            style={{
              ...buttonStyle,
              backgroundColor: '#6c757d',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              ...buttonStyle,
              backgroundColor: saving ? '#adb5bd' : '#198754',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? 'Сохранение...' : 'Добавить тег'}
          </button>
        </div>
      </form>
    </div>
  )
}

const containerStyle: CSSProperties = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: 8,
  padding: 20,
  marginBottom: 20,
}

const formStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 16,
}

const fieldGroupStyle: CSSProperties = {
  display: 'contents',
}

const labelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 14,
  fontWeight: 500,
}

const inputStyle: CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #dee2e6',
  borderRadius: 6,
  fontSize: 14,
}

const buttonStyle: CSSProperties = {
  border: 'none',
  borderRadius: 6,
  padding: '8px 16px',
  color: 'white',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
}

export default AddTagForm
