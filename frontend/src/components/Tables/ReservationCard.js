import React from "react";
import { motion } from "framer-motion";
import { Table, Clock, Users, Trash2 } from "lucide-react";

const ReservationCard = ({ reservation, onCancel }) => {
    const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <motion.div
            className="reservation-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.3 }}
        >
            <div className="reservation-info">
                <div className="reservation-header">
                    <div className="table-info">
                        <Table size={20} />
                        <h3>
                            Table {reservation.table_no || reservation.table_id}
                        </h3>
                    </div>
                    <div className="time-info">
                        <Clock size={16} />
                        <span>
                            {reservation.start_time && reservation.end_time
                                ? `${formatTime(
                                      reservation.start_time
                                  )} - ${formatTime(reservation.end_time)}`
                                : "Time not available"}
                        </span>
                    </div>
                </div>

                <div className="reservation-details">
                    <div className="detail-item">
                        <Users size={16} />
                        <span>{reservation.guest_count || 1} guests</span>
                    </div>
                </div>
            </div>

            <div className="reservation-actions">
                <motion.button
                    className="cancel-button"
                    onClick={() => onCancel(reservation.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Trash2 size={16} />
                    Cancel
                </motion.button>
            </div>
        </motion.div>
    );
};

export default ReservationCard;
