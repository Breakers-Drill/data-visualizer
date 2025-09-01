import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import drillSvg from "../assets/drill.svg";
import { useAllEdgesWithAttributes, useEdgeWithAttributes } from "../hooks/useEdges";
import EdgeStatusPanel from "../components/EdgeStatusPanel";
import type { Edge, EdgeWithAttributes, EdgeAttribute } from "../types/edge";

// Временный тип для совместимости со старой структурой Rig
interface RigCompatible extends Edge {
  id: string; // d_14820 -> 14820
  ok: boolean;
}

export default function RigsListPage() {
  const [hoveredRigId, setHoveredRigId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Получаем данные edges с атрибутами
  const { edgesWithAttributes, loading: edgesLoading } = useAllEdgesWithAttributes();
  
  // Получаем данные для наведенной буровой
  const hoveredEdgeKey = hoveredRigId ? `d_${hoveredRigId}` : null;
  const { edgeData: hoveredEdgeData, loading: hoveredLoading } = useEdgeWithAttributes(hoveredEdgeKey);

  // Функция для проверки ошибок в атрибутах
  const hasErrorsInAttributes = (attributes: EdgeAttribute | null | undefined) => {
    if (!attributes) return false;
    
    // Проверяем состояние оборудования
    const equipmentErrors = [
      attributes.bypass_state !== 'closed',
      attributes.drive_state !== 'normal'
    ];
    
    // Проверяем техническое обслуживание
    const maintenanceErrors = [
      attributes.daily_maintenance === false,
      attributes.weekly_maintenance === false,
      attributes.monthly_maintenance === false,
      attributes.semiannual_maintenance === false,
      attributes.annual_maintenance === false
    ];
    
    return equipmentErrors.some(error => error) || maintenanceErrors.some(error => error);
  };

  // Преобразуем edges в формат, совместимый со старой структурой
  const rigs: RigCompatible[] = useMemo(() => {
    return edgesWithAttributes.map((edge: EdgeWithAttributes): RigCompatible => ({
      ...edge,
      id: edge.key.replace('d_', ''), // d_14820 -> 14820
      ok: !hasErrorsInAttributes(edge.attributes) // Красный если есть ошибки
    }));
  }, [edgesWithAttributes]);

  const hoveredRig = useMemo(
    () => rigs.find((r) => r.id === hoveredRigId) || null,
    [rigs, hoveredRigId]
  );



  return (
    <div className="rigs-list">
      <div className="rigs-grid">
        {rigs.map((rig) => (
          <button
            key={rig.id}
            className={`rig-card${rig.ok ? " ok" : " bad"}`}
            onMouseEnter={() => setHoveredRigId(rig.id)}
            onMouseLeave={() => setHoveredRigId((prev) => (prev === rig.id ? null : prev))}
            onFocus={() => setHoveredRigId(rig.id)}
            onBlur={() => setHoveredRigId((prev) => (prev === rig.id ? null : prev))}
            onClick={() => navigate(`/rigs/${rig.id}`)}
          >
            <img src={drillSvg} alt="Буровая вышка" />
            <div className="rig-name" aria-label={rig.name || undefined} title={rig.name || undefined}>
              {rig.name}
            </div>
          </button>
        ))}
      </div>

      <aside className="rig-status-panel" aria-live="polite">
        
        {edgesLoading ? (
          <div style={{ minHeight: 256, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Загрузка буровых...
          </div>
        ) : hoveredRig ? (
          <>
            <div className="rig-status-header">
              <img src={drillSvg} alt="Схема буровой" className="rig-status-image" />
            </div>
            <div className="rig-status-title">
              <Link to={`/rigs/${hoveredRig.id}`} className={`rig-title-link${hoveredRig.ok ? " ok" : " bad"}`}>
                {hoveredRig.name || `БУ №${hoveredRig.id}`}
              </Link>
            </div>
            
            <div className="edge-status-container">
              <EdgeStatusPanel 
                attributes={hoveredEdgeData?.attributes || null} 
                loading={hoveredLoading}
              />
            </div>
          </>
        ) : (
          <div style={{ minHeight: 256 }} />
        )}
      </aside>
    </div>
  );
}


