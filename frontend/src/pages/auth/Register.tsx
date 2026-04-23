import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { useAuth } from '@hooks/useAuth';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return; // Add validation logic/toast
    }
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      // Handled by toast
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <Helmet>
        <title>Register | AlphaPowerZone</title>
      </Helmet>

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            Join the <span className="text-orange-600">Squad</span>
          </h1>
          <p className="text-zinc-500 mt-2">Start your elite fitness transformation today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            showPasswordToggle
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />

          <Button type="submit" size="lg" className="w-full mt-4" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <p className="text-center mt-8 text-zinc-500">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-600 font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
