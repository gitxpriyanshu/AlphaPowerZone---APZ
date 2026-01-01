import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CategoryPage from './pages/CategoryPage';
import OwnerDashboard from './pages/OwnerDashboard';
import UserDashboard from './pages/UserDashboard';
import MyOrders from './pages/MyOrders';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/category/:categoryId" element={<CategoryPage />} />
      <Route path="/dashboard" element={<OwnerDashboard />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
      <Route path="/orders" element={<MyOrders />} />
    </Routes>
  );
}

export default App;

