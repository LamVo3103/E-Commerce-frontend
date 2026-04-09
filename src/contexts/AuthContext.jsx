import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Lấy token từ localStorage nếu có (giúp F5 không bị văng ra ngoài)
    const [token, setToken] = useState(localStorage.getItem('accessToken') || null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        if (token) {
            try {
                // Giải mã token để lấy role (dựa theo backend của bạn)
                const decoded = jwtDecode(token);
                setUserRole(decoded.role); 
                localStorage.setItem('accessToken', token);
            } catch (error) {
                console.error("Invalid token:", error);
                logout();
            }
        } else {
            localStorage.removeItem('accessToken');
            setUserRole(null);
        }
    }, [token]);

    const login = (newToken) => {
        setToken(newToken);
    };

    const logout = () => {
        setToken(null);
        // Có thể gọi thêm API logout của Backend ở đây nếu cần xóa Cookie
    };

    return (
        <AuthContext.Provider value={{ token, userRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook để gọi cho lẹ
export const useAuth = () => useContext(AuthContext);