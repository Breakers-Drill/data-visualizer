import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import MainPage from "./pages/MainPage";
import RigsListPage from "./pages/RigsListPage";
import TopBar from "./components/TopBar";
import ChartsPage from "./pages/ChartsPage.tsx";
import TagsPage from "./pages/TagsPage";

const Nav = () => (
  <TopBar />
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
        {/* Главная страница со списком буровых */}
        <Route path="/" element={<RigsListPage />} />

        {/* Детальная страница буровой */}
        <Route element={<Layout />}>
          <Route path="/rigs/:rigId" element={<MainPage />} />
        </Route>

        {/* Пространство charts */}
        <Route element={<Layout />}>
          <Route path="/charts" element={<ChartsPage />} />
        </Route>

        {/* Страница тегов */}
        <Route element={<Layout />}>
          <Route path="/tags" element={<TagsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
