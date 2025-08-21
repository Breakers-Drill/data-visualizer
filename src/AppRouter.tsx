import { BrowserRouter, Routes, Route, Link, Navigate, Outlet } from "react-router-dom";
import MainPage from "./pages/MainPage";
import SeparateChartsPage from "./pages/SeparateChartsPage";
import CombinedChartPage from "./pages/CombinedChartPage";
import TagsPage from "./pages/TagsPage";

const Nav = () => (
  <div
    style={{
      padding: "12px 16px",
      borderBottom: "1px solid #e9ecef",
      display: "flex",
      gap: 12,
      background: "#ffffff",
    }}
  >
    <Link to="/" style={{ color: "#0d6efd", textDecoration: "none" }}>
      Главная
    </Link>
    <Link to="/charts/separate" style={{ color: "#0d6efd", textDecoration: "none" }}>
      Отдельные графики
    </Link>
    <Link to="/charts/combined" style={{ color: "#0d6efd", textDecoration: "none" }}>
      Совмещенный график
    </Link>
    <Link to="/tags" style={{ color: "#0d6efd", textDecoration: "none" }}>
      Теги
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
        {/* Главная страница */}
        <Route path="/" element={<MainPage />} />

        {/* Пространство charts */}
        <Route path="/charts" element={<Layout />}>
          <Route index element={<Navigate to="combined" replace />} />
          <Route path="combined" element={<CombinedChartPage />} />
          <Route path="separate" element={<SeparateChartsPage />} />
        </Route>

        {/* Страница тегов */}
        <Route path="/tags" element={<TagsPage />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
