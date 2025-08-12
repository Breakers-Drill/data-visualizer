import { BrowserRouter, Routes, Route, Link, Navigate, Outlet } from "react-router-dom";
import SeparateChartsPage from "./pages/SeparateChartsPage";
import CombinedChartPage from "./pages/CombinedChartPage";

const Nav = () => (
  <div
    style={{
      padding: "12px 16px",
      borderBottom: "1px solid #333",
      display: "flex",
      gap: 12,
    }}
  >
    <Link to="/charts/separate" style={{ color: "#61dafb", textDecoration: "none" }}>
      Отдельные графики
    </Link>
    <Link to="/charts/combined" style={{ color: "#61dafb", textDecoration: "none" }}>
      Совмещенный график
    </Link>
  </div>
);

const Layout = () => (
  <>
    <Nav />
    <Outlet />
  </>
);

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Корень редиректим на основной сценарий */}
        <Route path="/" element={<Navigate to="/charts/combined" replace />} />

        {/* Пространство charts */}
        <Route path="/charts" element={<Layout />}>
          <Route index element={<Navigate to="combined" replace />} />
          <Route path="combined" element={<CombinedChartPage />} />
          <Route path="separate" element={<SeparateChartsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/charts/combined" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
