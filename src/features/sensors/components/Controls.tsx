import React from "react";

interface ControlsProps {
  selectedTags: string[];
  allTags: string[];
  startDate: string;
  endDate: string;
  interval: string;
  onToggleTag: (tag: string) => void;
  onStartDate: (v: string) => void;
  onEndDate: (v: string) => void;
  onInterval: (v: string) => void;
  tagNameMap?: Record<string, string>;
}

export const Controls: React.FC<ControlsProps> = ({
  selectedTags,
  allTags,
  startDate,
  endDate,
  interval,
  onToggleTag,
  onStartDate,
  onEndDate,
  onInterval,
  tagNameMap = {},
}) => {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const target = e.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div className="control-panel" ref={rootRef}>
      <div className="control-group">
        <label className="control-label">Теги сенсоров:</label>
        <div className="custom-multi-select">
          <div className="select-input-container">
            <div className="selected-tags-display">
              {selectedTags.map((tag) => (
                <span key={tag} className="tag-chip">
                  <span title={tag}>{tagNameMap[tag] || tag}</span>
                  <button onClick={() => onToggleTag(tag)} className="tag-remove">
                    ×
                  </button>
                </span>
              ))}
            </div>
            <button className="select-dropdown-button" onClick={() => setOpen(!open)}>
              ▼
            </button>
          </div>
          {open && (
            <div className="select-dropdown">
              {allTags.map((tag) => (
                <div
                  key={tag}
                  className={`dropdown-option ${selectedTags.includes(tag) ? "selected" : ""}`}
                  onClick={() => onToggleTag(tag)}
                >
                  {selectedTags.includes(tag) && <span className="checkmark">✓</span>}
                  {tagNameMap[tag] || tag}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="control-group">
        <label className="control-label">Начальная дата:</label>
        <input type="datetime-local" value={startDate} onChange={(e) => onStartDate(e.target.value)} className="control-input" />
      </div>

      <div className="control-group">
        <label className="control-label">Конечная дата:</label>
        <input type="datetime-local" value={endDate} onChange={(e) => onEndDate(e.target.value)} className="control-input" />
      </div>

      <div className="control-group">
        <label className="control-label">Интервал:</label>
        <select value={interval} onChange={(e) => onInterval(e.target.value)} className="control-input">
          <option value="1min">1 минута</option>
          <option value="5min">5 минут</option>
          <option value="10min">10 минут</option>
          <option value="30min">30 минут</option>
          <option value="1h">1 час</option>
          <option value="1d">1 день</option>
        </select>
      </div>
    </div>
  );
};

export default Controls;


