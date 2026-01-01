import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', age: '', mobile: '', address: ''
    });
    const [isOwner, setIsOwner] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const endpoint = isOwner ? '/owners/signup' : '/users/signup';
        const payload = isOwner
            ? { name: formData.name, email: formData.email, password: formData.password }
            : formData;

        try {
            await api.post(endpoint, payload);
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            {isOwner ? 'Become a Partner' : 'Create Account'}
                        </h2>
                    </div>
                    {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center border border-red-200">{error}</div>}
                    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                        <input name="name" placeholder="Full Name" onChange={handleChange} className="input-field" required />
                        <input name="email" type="email" placeholder="Email Address" onChange={handleChange} className="input-field" required />
                        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="input-field" required />

                        {!isOwner && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="age" type="number" placeholder="Age" onChange={handleChange} className="input-field" required />
                                    <input name="mobile" placeholder="Mobile Number" onChange={handleChange} className="input-field" required />
                                </div>
                                <textarea
                                    name="address"
                                    placeholder="Delivery Address (Optional)"
                                    onChange={handleChange}
                                    className="input-field h-20 resize-none"
                                    rows="3"
                                />
                            </>
                        )}

                        <button type="submit" className="w-full btn btn-primary mt-4">
                            Register
                        </button>
                    </form>
                    <div className="flex items-center justify-center mt-4">
                        <label className="flex items-center space-x-2 cursor-pointer select-none text-gray-600 hover:text-gray-900 transition font-medium text-sm p-2 rounded-lg hover:bg-gray-100 w-full justify-center">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary transition duration-150 ease-in-out"
                                checked={isOwner}
                                onChange={(e) => setIsOwner(e.target.checked)}
                            />
                            <span>Register as Owner</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
