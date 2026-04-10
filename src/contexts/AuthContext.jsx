import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('accessToken') || null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Đề phòng backend trả về 'role' hoặc 'roles'
                setUserRole(decoded.role || decoded.roles || null); 
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
        setUserRole(null); // Xóa quyền ngay lập tức khi đăng xuất
        localStorage.removeItem('accessToken');
    };

    return (
        <AuthContext.Provider value={{ token, userRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);