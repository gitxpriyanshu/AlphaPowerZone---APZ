import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { useAuth } from '@hooks/useAuth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      // Handled by toast
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <Helmet>
        <title>Login | AlphaPowerZone</title>
      </Helmet>

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            Welcome <span className="text-orange-600">Back</span>
          </h1>
          <p className="text-zinc-500 mt-2">Login to access your fitness journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showPasswordToggle
            required
          />

          <div className="flex items-center justify-end">
            <Link to="/forgot-password" className="text-sm text-orange-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <p className="text-center mt-8 text-zinc-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-orange-600 font-bold hover:underline">
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
