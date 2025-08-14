import React from "react";

interface TagLimits { upperLimit: number; lowerLimit: number }

interface LimitsPanelProps {
  tags: string[];
  tagLimits: { [tag: string]: TagLimits };
  onChange: (tag: string, type: "upper" | "lower", value: string) => void;
  getColor?: (tag: string, index: number) => string;
}

export const LimitsPanel: React.FC<LimitsPanelProps> = ({ tags, tagLimits, onChange, getColor }) => {
  return (
    <div style={{ width: 220 }}>
      {tags.map((tag, idx) => {
        const limits = tagLimits[tag] || { upperLimit: 42, lowerLimit: 18 };
        const color = getColor ? getColor(tag, idx) : undefined;
        return (
          <div key={tag} style={{ marginBottom: 16, border: "1px solid #333", padding: 8, borderRadius: 6 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: color }}>{tag}</div>
            <div className="limit-group" style={{ marginBottom: 8 }}>
              <label className="limit-label">Верхняя уставка:</label>
              <input
                type="number"
                value={limits.upperLimit}
                onChange={(e) => onChange(tag, "upper", e.target.value)}
                className="limit-input"
                step="0.1"
                // temporary disabled
                disabled
              />
            </div>
            <div className="limit-group">
              <label className="limit-label">Нижняя уставка:</label>
              <input
                type="number"
                value={limits.lowerLimit}
                onChange={(e) => onChange(tag, "lower", e.target.value)}
                className="limit-input"
                step="0.1"
                // temporary disabled
                disabled
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LimitsPanel;


