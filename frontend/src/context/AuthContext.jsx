import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { role: 'user' | 'owner', data: ... }
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in (persistence logic would go here, checking cookie or local storage if needed)
        // For now, since we use HttpOnly cookies, we might need a /me endpoint to verify session on load.
        // Or we just rely on local state being lost on refresh for this demo unless we implement persistence.
        // Let's implement basic persistence using localStorage for role/name just for UI state, or add a /me endpoint (better).
        // Given the task scope, let's stick to simple state. If refresh happens, user logs in again.
        // Or better, let's use localStorage to persist the "user" object to keep UI sync. 
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const loginUser = async (email, password) => {
        try {
            const res = await api.post('/users/signin', { email, password });
            const userData = res.data.user; // Backend now returns { message, user: {id, name, email, role: 'user'} }
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Login failed' };
        }
    };

    const loginOwner = async (email, password) => {
        try {
            const res = await api.post('/owners/signin', { email, password });
            const ownerData = res.data.owner; // Backend returns { message, owner: {id, name, email, role: 'owner'} }
            setUser(ownerData);
            localStorage.setItem('user', JSON.stringify(ownerData));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Login failed' };
        }
    };

    const logout = async () => {
        try {
            const endpoint = user?.role === 'owner' ? '/owners/logout' : '/users/logout';
            await api.post(endpoint);
        } catch (err) {
            console.error("Logout error", err);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loginUser, loginOwner, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
