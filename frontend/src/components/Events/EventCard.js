import React from "react";
import { motion } from "framer-motion";
import { Calendar, Users, MapPin, Clock } from "lucide-react";

const EventCard = ({ event, onRSVP, userReservations }) => {
    const isReserved = userReservations.some(
        (res) => res.event_id === event.id
    );
    const isFullyBooked = event.remaining_capacity === 0;

    return (
        <motion.div
            className="event-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <div className="event-header">
                <div className="event-icon">
                    <Calendar size={24} />
                </div>
                <div className="event-status">
                    {isReserved ? (
                        <span className="status reserved">Reserved</span>
                    ) : isFullyBooked ? (
                        <span className="status full">Full</span>
                    ) : (
                        <span className="status available">Available</span>
                    )}
                </div>
            </div>

            <div className="event-content">
                <h3>{event.name}</h3>
                <p className="event-description">{event.description}</p>

                <div className="event-details">
                    <div className="detail-item">
                        <Clock size={16} />
                        <span>{event.date}</span>
                    </div>
                    <div className="detail-item">
                        <Users size={16} />
                        <span>
                            {event.remaining_capacity} / {event.capacity} spots
                            left
                        </span>
                    </div>
                </div>

                <div className="capacity-bar">
                    <div
                        className="capacity-fill"
                        style={{
                            width: `${
                                ((event.capacity - event.remaining_capacity) /
                                    event.capacity) *
                                100
                            }%`,
                        }}
                    />
                </div>
            </div>

            <div className="event-actions">
                {!isReserved && !isFullyBooked && (
                    <motion.button
                        className="rsvp-button"
                        onClick={() => onRSVP(event.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        RSVP Now
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};

export default EventCard;
