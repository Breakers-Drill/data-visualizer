import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import drillSvg from "../assets/drill.svg";
import { getRigs } from "../api/rigs";
import type { Rig } from "../types/rig";

export default function RigsListPage() {
  const [rigs, setRigs] = useState<Rig[]>([]);
  const [hoveredRigId, setHoveredRigId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getRigs().then(setRigs);
  }, []);

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
            <div className="rig-name" aria-label={rig.name} title={rig.name}>
              {rig.name}
            </div>
          </button>
        ))}
      </div>

      <aside className="rig-status-panel" aria-live="polite">
        {hoveredRig ? (
          <>
            <div className="rig-status-header">
              <img src={drillSvg} alt="Схема буровой" className="rig-status-image" />
            </div>
            <div className="rig-status-title">
              <Link to={`/rigs/${hoveredRig.id}`} className={`rig-title-link${hoveredRig.ok ? " ok" : " bad"}`}>
                {hoveredRig.name}
              </Link>
            </div>
            <ul className="sensor-tags" style={{ minHeight: 176 }}>
              {hoveredRig.sensors.map((s) => (
                <li key={s.id} className={`sensor-tag${s.ok ? " ok" : " bad"}`}>
                  <span className="dot" />
                  <span className="label">{s.name}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div style={{ minHeight: 256 }} />
        )}
      </aside>
    </div>
  );
}


