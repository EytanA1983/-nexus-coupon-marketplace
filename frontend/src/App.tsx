import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import ProductList from "./pages/customer/ProductList";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/customer/products" replace />} />
        <Route path="/customer/products" element={<ProductList />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/products" element={<AdminProductsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

