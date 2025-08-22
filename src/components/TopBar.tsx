import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getRigById } from "../api/rigs";

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();


  const params = new URLSearchParams(location.search);
  let mode = params.get("mode") || "";
  if (!mode) {
    if (location.pathname.includes("/separate")) mode = "separate";
    if (location.pathname.includes("/combined")) mode = "combined";
  }

  // Имя буровой, если rigId присутствует
  const [rigName, setRigName] = useState<string | null>(null);
  const rigIdFromPath = location.pathname.startsWith("/rigs/")
    ? location.pathname.split("/")[2]
    : null;
  const rigIdFromQuery = params.get("rig");
  const rigId = rigIdFromPath || rigIdFromQuery;

  useEffect(() => {
    if (!rigId) { setRigName(null); return; }
    let canceled = false;
    getRigById(rigId).then((rig) => {
      if (!canceled) setRigName(rig?.name || `БУ №${rigId}`);
    });
    return () => { canceled = true; };
  }, [rigId]);

  const crumbs: { label: string; to?: string }[] = [{ label: "Главная", to: "/" }];

  if (rigId) {
    crumbs.push({ label: rigName || `БУ №${rigId}`, to: `/rigs/${rigId}` });
  }

  if (location.pathname.startsWith("/charts")) {
    crumbs.push({ label: "Графики" });
    if (mode) crumbs.push({ label: mode === "separate" ? "Отдельные" : "Совмещенный" });
  }

  return (
    <div className="topbar">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        {crumbs.map((c, i) => (
          <span key={i} className="crumb">
            {c.to && i !== crumbs.length - 1 ? (
              <a href={c.to} onClick={(e) => { e.preventDefault(); navigate(c.to!); }}>{c.label}</a>
            ) : (
              <span>{c.label}</span>
            )}
            {i < crumbs.length - 1 && <span className="sep">/</span>}
          </span>
        ))}
      </nav>
    </div>
  );
}


