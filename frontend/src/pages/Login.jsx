import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isOwner, setIsOwner] = useState(false);
    const { loginUser, loginOwner } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = isOwner
            ? await loginOwner(email, password)
            : await loginUser(email, password);

        if (res.success) {
            navigate(isOwner ? '/dashboard' : '/');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            {isOwner ? 'Owner Portal' : 'Welcome Back'}
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Sign in to your account
                        </p>
                    </div>
                    {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center border border-red-200">{error}</div>}
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div className="mb-4">
                                <label className="sr-only">Email address</label>
                                <input
                                    type="email"
                                    required
                                    className="input-field"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="sr-only">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="input-field"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button type="submit" className="group relative w-full flex justify-center btn btn-primary">
                                Sign in
                            </button>
                        </div>
                    </form>
                    <div className="flex items-center justify-center mt-4">
                        <label className="flex items-center space-x-2 cursor-pointer select-none text-gray-600 hover:text-gray-900 transition font-medium text-sm p-2 rounded-lg hover:bg-gray-100 w-full justify-center">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary transition duration-150 ease-in-out"
                                checked={isOwner}
                                onChange={(e) => setIsOwner(e.target.checked)}
                            />
                            <span>Login as Owner</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
