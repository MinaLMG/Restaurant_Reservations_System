import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

const API_URL = process.env.REACT_APP_API_URL;
const LOGIN_ENDPOINT = "/auth/login";
const REGISTER_ENDPOINT = "/auth/register";

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Set up axios interceptor to always include token
    useEffect(() => {
        const setupAxiosInterceptor = () => {
            axios.interceptors.request.use(
                (config) => {
                    const currentToken = localStorage.getItem("token");
                    if (currentToken) {
                        config.headers.Authorization = `Bearer ${currentToken}`;
                    }
                    return config;
                },
                (error) => {
                    return Promise.reject(error);
                }
            );
        };

        setupAxiosInterceptor();
    }, []);

    useEffect(() => {
        if (token) {
            // Set default header
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            // Decode token to get user info
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                setUser({
                    username: payload.username,
                    role: payload.role,
                    id: payload.id,
                });
            } catch (error) {
                console.error("Invalid token");
                logout();
            }
        } else {
            // Remove default header if no token
            delete axios.defaults.headers.common["Authorization"];
        }
        setLoading(false);
    }, [token]);

    const login = async (username, password) => {
        try {
            const formData = new FormData();
            formData.append("username", username);
            formData.append("password", password);

            const response = await axios.post(
                `${API_URL}${LOGIN_ENDPOINT}`,
                formData,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const { access_token } = response.data;
            setToken(access_token);
            localStorage.setItem("token", access_token);
            axios.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${access_token}`;

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || "Login failed",
            };
        }
    };

    const register = async (username, password) => {
        try {
            await axios.post(`${API_URL}${REGISTER_ENDPOINT}`, {
                username,
                password,
            });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || "Registration failed",
            };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
    };

    const value = {
        token,
        user,
        login,
        register,
        logout,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
