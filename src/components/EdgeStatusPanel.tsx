import type { EdgeAttribute } from '../types/edge';

interface EdgeStatusPanelProps {
  attributes: EdgeAttribute | null;
  loading: boolean;
  onStatusChange?: (hasErrors: boolean) => void;
}

interface StatusItem {
  key: keyof EdgeAttribute;
  label: string;
  value: boolean | null;
}

interface StatusGroup {
  title: string;
  items: StatusItem[];
}

export default function EdgeStatusPanel({ attributes, loading, onStatusChange }: EdgeStatusPanelProps) {
  

  if (loading) {
    return (
      <div className="edge-status-panel">
        <div className="status-loading">Загрузка статусов...</div>
      </div>
    );
  }

  if (!attributes) {
    // Если нет атрибутов, считаем что ошибок нет
    onStatusChange?.(false);
    return (
      <div className="edge-status-panel">
        <div className="status-empty">Данные о статусах недоступны</div>
      </div>
    );
  }

  const statusGroups: StatusGroup[] = [
    {
      title: "Состояние оборудования", 
      items: [
        { key: 'bypass_state', label: 'Состояние байпасов', value: attributes.bypass_state === 'closed' },
        { key: 'drive_state', label: 'Привода без аварии', value: attributes.drive_state === 'normal' }
      ]
    },
    {
      title: "Техническое обслуживание",
      items: [
        { key: 'daily_maintenance', label: 'Ежедневное ТО', value: attributes.daily_maintenance },
        { key: 'weekly_maintenance', label: 'Еженедельное ТО', value: attributes.weekly_maintenance },
        { key: 'monthly_maintenance', label: 'Ежемесячное ТО', value: attributes.monthly_maintenance },
        { key: 'semiannual_maintenance', label: 'Полугодовое ТО', value: attributes.semiannual_maintenance },
        { key: 'annual_maintenance', label: 'Годовое ТО', value: attributes.annual_maintenance }
      ]
    }
  ];

  // Проверяем, есть ли красные статусы (ошибки)
  const hasErrors = statusGroups.some(group => 
    group.items.some(item => item.value === false)
  );

  // Уведомляем родительский компонент об изменении статуса
  onStatusChange?.(hasErrors);

  // Дополнительные статусы (серые, неактивные)
  const additionalStatuses = [
    "Состояние ПЧ",
    "Температура двигателей",
    "Уровень масла",
    "Давление в системе",
    "Состояние фильтров", 
    "Видеонаблюдение"
  ];

  return (
    <div className="edge-status-panel">
      {statusGroups.map((group) => (
        <div key={group.title} className="status-group">
          <h3 className="status-group-title">{group.title}</h3>
          <div className="status-items">
            {group.items.map((item) => (
              <div key={item.key} className="status-item">
                <div 
                  className={`status-indicator ${
                    item.value === true ? 'status-ok' : 
                    item.value === false ? 'status-error' : 
                    'status-unknown'
                  }`}
                />
                <span className="status-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="status-group">
        <h3 className="status-group-title">Дополнительные параметры</h3>
        <div className="status-items">
          {additionalStatuses.map((status) => (
            <div key={status} className="status-item status-disabled">
              <div className="status-indicator status-disabled" />
              <span className="status-label">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
