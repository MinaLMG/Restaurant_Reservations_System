import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Table, Users, Clock } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
    const { user } = useAuth();

    const cards = [
        {
            title: "Events",
            description: "Browse and RSVP to upcoming events",
            icon: Calendar,
            link: "/events",
            color: "#667eea",
        },
        {
            title: "Table Reservations",
            description: "Reserve tables for your dining experience",
            icon: Table,
            link: "/tables",
            color: "#764ba2",
        },
    ];

    return (
        <div className="dashboard">
            <div className="dashboard-container">
                <motion.div
                    className="dashboard-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1>Welcome back, {user?.username}!</h1>
                    <p>What would you like to do today?</p>
                </motion.div>

                <div className="dashboard-grid">
                    {cards.map((card, index) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            style={{
                                border: "1px solid #ccc",
                                borderRadius: "3%",
                                borderLeft: "none",
                            }}
                        >
                            <Link to={card.link} className="dashboard-card">
                                <div
                                    className="card-icon"
                                    style={{ backgroundColor: card.color }}
                                >
                                    <card.icon size={32} />
                                </div>
                                <h3>{card.title}</h3>
                                <p>{card.description}</p>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
