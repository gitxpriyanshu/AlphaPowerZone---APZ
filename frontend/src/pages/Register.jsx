import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

const Register = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    mobile: "",
    address: "",
  });
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/users/signup", formData);
      showToast("Registration successful! Please login.", "success");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create Account
            </h2>
          </div>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center border border-red-200">
              {error}
            </div>
          )}
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              className="input-field"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              onChange={handleChange}
              className="input-field"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              className="input-field"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                name="age"
                type="number"
                placeholder="Age"
                onChange={handleChange}
                className="input-field"
                required
              />
              <input
                name="mobile"
                placeholder="Mobile Number"
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <textarea
              name="address"
              placeholder="Delivery Address (Optional)"
              onChange={handleChange}
              className="input-field h-20 resize-none"
              rows="3"
            />

            <button type="submit" className="w-full btn btn-primary mt-4">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
