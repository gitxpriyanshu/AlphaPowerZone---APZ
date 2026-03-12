import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CategoryPage from './pages/CategoryPage';
import OwnerDashboard from './pages/OwnerDashboard';
import UserDashboard from './pages/UserDashboard';
import MyOrders from './pages/MyOrders';
import OwnerLogin from './pages/OwnerLogin';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/owner-login" element={<OwnerLogin />} />
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

