import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/Layout';
import { Login, Register } from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Stores from './pages/Stores';
import Ratings from './pages/Ratings';
import Favorites from './pages/Favorites';
import StoreDetail from './pages/StoreDetail';
import { AdminRatings, AdminStores, AdminUsers } from './pages/Admin';
import OwnerRatings from './pages/Owner';
import OwnerStore from './pages/OwnerStore';
import { ChangePassword, Profile } from './pages/Profile';
import AdminUserDetail from './pages/AdminUserDetail';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'OWNER' ? '/owner/dashboard' : '/user/dashboard'} replace />;
}

function App() {
  return <ToastProvider><AuthProvider><Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route element={<ProtectedRoute />}><Route element={<Layout />}>
      <Route path="/profile" element={<Profile />} />
      <Route path="/change-password" element={<ChangePassword />} />
    </Route></Route>
    <Route element={<ProtectedRoute roles={['ADMIN']} />}><Route element={<Layout />}>
      <Route path="/admin/dashboard" element={<Dashboard role="ADMIN" />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/users/:id" element={<AdminUserDetail />} />
      <Route path="/admin/stores" element={<AdminStores />} />
      <Route path="/admin/ratings" element={<AdminRatings />} />
    </Route></Route>
    <Route element={<ProtectedRoute roles={['USER']} />}><Route element={<Layout />}>
      <Route path="/user/dashboard" element={<Dashboard role="USER" />} />
      <Route path="/user/stores" element={<Stores />} />
      <Route path="/user/ratings" element={<Ratings />} />
      <Route path="/user/favorites" element={<Favorites />} />
      <Route path="/stores/:id" element={<StoreDetail />} />
    </Route></Route>
    <Route element={<ProtectedRoute roles={['OWNER']} />}><Route element={<Layout />}>
      <Route path="/owner/dashboard" element={<Dashboard role="OWNER" />} />
      <Route path="/owner/store" element={<OwnerStore />} />
      <Route path="/owner/ratings" element={<OwnerRatings />} />
    </Route></Route>
    <Route path="*" element={<HomeRedirect />} />
  </Routes></AuthProvider></ToastProvider>;
}

export default App;
