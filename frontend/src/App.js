import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./components/Dashboard/Dashboard";
import Events from "./components/Events/Events";
import Tables from "./components/Tables/Tables";
import Navbar from "./components/Layout/Navbar";
import "./App.css";

function ProtectedRoute({ children }) {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Navbar />
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/events"
                            element={
                                <ProtectedRoute>
                                    <Navbar />
                                    <Events />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/tables"
                            element={
                                <ProtectedRoute>
                                    <Navbar />
                                    <Tables />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
