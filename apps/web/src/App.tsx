import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { AppShell } from './layout/AppShell';
import { CategoryPage } from './pages/CategoryPage';
import { Dashboard } from './pages/Dashboard';
import { FavoritesPage } from './pages/FavoritesPage';
import { NotFound } from './pages/NotFound';
import { ToolPage } from './pages/ToolPage';
import { AppStateProvider } from './state/AppState';

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'category/:id', element: <CategoryPage /> },
      { path: 'tools/:id', element: <ToolPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export function App() {
  return (
    <AppStateProvider>
      <RouterProvider router={router} />
    </AppStateProvider>
  );
}
