import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Users, Plus, Eye } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const API_URL = process.env.REACT_APP_API_URL;

const Events = () => {
    const { user, token } = useAuth();
    const [events, setEvents] = useState([]);
    const [userReservations, setUserReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState("events");

    useEffect(() => {
        if (token) {
            fetchEvents();
            fetchUserReservations();
        }
    }, [token]);

    const fetchEvents = async () => {
        try {
            const response = await axios.get(`${API_URL}/events`);
            setEvents(response.data);
        } catch (error) {
            console.error("Error fetching events:", error);
            if (error.response?.status === 401) {
                console.error("Authentication failed - please login again");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchUserReservations = async () => {
        try {
            const response = await axios.get(`${API_URL}/events/me`);
            setUserReservations(response.data);
        } catch (error) {
            console.error("Error fetching reservations:", error);
            if (error.response?.status === 404) {
                console.error("Reservations endpoint not found");
            }
        }
    };

    const handleRSVP = async (eventId) => {
        try {
            await axios.post(`${API_URL}/events/${eventId}/rsvp`);
            fetchEvents();
            fetchUserReservations();
        } catch (error) {
            alert(error.response?.data?.detail || "RSVP failed");
        }
    };

    const handleCreateEvent = async (eventData) => {
        try {
            // Convert datetime-local to the format expected by backend
            const formattedData = {
                name: eventData.title, // Backend expects 'name'
                description: eventData.description,
                date: eventData.event_date.split("T")[0], // Backend expects 'date' (date only)
                capacity: parseInt(eventData.capacity),
                remaining_capacity: parseInt(eventData.capacity), // Set initial remaining capacity
            };

            await axios.post(`${API_URL}/events`, formattedData);
            fetchEvents();
            setShowCreateModal(false);
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to create event");
        }
    };

    const handleCancelReservation = async (eventId) => {
        try {
            await axios.delete(`${API_URL}/events/${eventId}/rsvp`);
            fetchEvents();
            fetchUserReservations();
        } catch (error) {
            alert(
                error.response?.data?.detail || "Failed to cancel reservation"
            );
        }
    };

    if (loading) {
        return <div className="loading">Loading events...</div>;
    }

    return (
        <div className="events-page">
            <div className="events-container">
                <div className="events-header">
                    <h1>Events</h1>
                    <div className="header-actions">
                        <div className="tabs">
                            <button
                                className={`tab ${
                                    activeTab === "events" ? "active" : ""
                                }`}
                                onClick={() => setActiveTab("events")}
                            >
                                <Calendar size={20} />
                                Browse Events
                            </button>
                            <button
                                className={`tab ${
                                    activeTab === "reservations" ? "active" : ""
                                }`}
                                onClick={() => setActiveTab("reservations")}
                            >
                                <Eye size={20} />
                                My RSVPs
                            </button>
                        </div>
                        {user?.role === "admin" && (
                            <button
                                className="create-button"
                                onClick={() => setShowCreateModal(true)}
                            >
                                <Plus size={20} />
                                Create Event
                            </button>
                        )}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === "events" ? (
                        <motion.div
                            key="events"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="events-grid">
                                {events.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        userReservations={userReservations}
                                        onRSVP={handleRSVP}
                                        onCancel={handleCancelReservation}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="reservations"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {userReservations.length === 0 ? (
                                <div className="empty-state">
                                    <Calendar size={64} />
                                    <h3>No RSVPs yet</h3>
                                    <p>You haven't RSVP'd to any events.</p>
                                </div>
                            ) : (
                                <div className="reservations-list">
                                    {userReservations.map((reservation) => (
                                        <ReservationCard
                                            key={reservation.id}
                                            reservation={reservation}
                                            onCancel={handleCancelReservation}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {showCreateModal && (
                    <CreateEventModal
                        onClose={() => setShowCreateModal(false)}
                        onSubmit={handleCreateEvent}
                    />
                )}
            </div>
        </div>
    );
};

// Event Card Component
const EventCard = ({ event, userReservations, onRSVP, onCancel }) => {
    const hasRSVP = userReservations.some((res) => res.event_id === event.id);

    const formatDateTime = (dateString) => {
        // Handle both date formats
        if (dateString.includes("T")) {
            return new Date(dateString).toLocaleString();
        } else {
            return new Date(dateString + "T00:00:00").toLocaleDateString();
        }
    };

    return (
        <motion.div
            className="event-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
        >
            <div className="event-info">
                <h3>{event.name}</h3>
                <p className="event-description">{event.description}</p>
                <div className="event-details">
                    <div className="detail-item">
                        <Clock size={16} />
                        <span>{formatDateTime(event.date)}</span>
                    </div>
                    <div className="detail-item">
                        <Users size={16} />
                        <span>
                            {event.remaining_capacity} / {event.capacity}{" "}
                            available
                        </span>
                    </div>
                </div>
            </div>
            <div className="event-actions">
                {hasRSVP ? (
                    <button
                        className="cancel-button"
                        onClick={() => onCancel(event.id)}
                    >
                        Cancel RSVP
                    </button>
                ) : (
                    <button
                        className="rsvp-button"
                        onClick={() => onRSVP(event.id)}
                        disabled={event.remaining_capacity === 0}
                    >
                        {event.remaining_capacity === 0 ? "Full" : "RSVP"}
                    </button>
                )}
            </div>
        </motion.div>
    );
};

// Reservation Card Component
const ReservationCard = ({ reservation, onCancel }) => {
    const formatDateTime = (dateString) => {
        if (dateString.includes("T")) {
            return new Date(dateString).toLocaleString();
        } else {
            return new Date(dateString + "T00:00:00").toLocaleDateString();
        }
    };

    return (
        <motion.div className="reservation-card">
            <div className="reservation-info">
                <h3>{reservation.title}</h3>
                <p>{reservation.description}</p>
                <div className="reservation-details">
                    <Clock size={16} />
                    <span>{formatDateTime(reservation.event_date)}</span>
                </div>
            </div>
            <button
                className="cancel-button"
                onClick={() => onCancel(reservation.event_id)}
            >
                Cancel RSVP
            </button>
        </motion.div>
    );
};

// Create Event Modal Component
const CreateEventModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        event_date: "",
        capacity: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Event</h2>
                    <button onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Event Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    title: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Event Date & Time</label>
                        <input
                            type="datetime-local"
                            value={formData.event_date}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    event_date: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Capacity</label>
                        <input
                            type="number"
                            value={formData.capacity}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    capacity: e.target.value,
                                })
                            }
                            min="1"
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit">Create Event</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Events;
