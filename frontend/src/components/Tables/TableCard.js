import React from "react";
import { motion } from "framer-motion";
import { Table, Users, Clock, CheckCircle } from "lucide-react";
import "./Tables.css";

const TableCard = ({ table, slots, onReserve, userReservations }) => {
    const isReserved = userReservations.some(
        (res) => res.table_id === table.id
    );
    const availableSlots = slots.filter(
        (slot) =>
            !userReservations.some(
                (res) => res.table_id === table.id && res.slot_id === slot.id
            )
    );

    return (
        <motion.div
            className="table-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <div className="table-header">
                <div className="table-icon">
                    <Table size={32} />
                </div>
                <div className="table-number">Table {table.table_no}</div>
            </div>

            <div className="table-content">
                <div className="table-info">
                    <div className="info-item">
                        <Users size={16} />
                        <span>Seats {table.capacity}</span>
                    </div>
                    <div className="info-item">
                        <Clock size={16} />
                        <span>{availableSlots.length} slots available</span>
                    </div>
                </div>

                <div className="table-visual">
                    <div className={`table-shape capacity-${table.capacity}`}>
                        {Array.from({ length: table.capacity }, (_, i) => (
                            <div key={i} className="seat" />
                        ))}
                    </div>
                </div>

                {isReserved && (
                    <div className="reserved-badge">
                        <CheckCircle size={16} />
                        Reserved
                    </div>
                )}
            </div>

            <div className="table-actions">
                <motion.button
                    className="select-button"
                    onClick={() => onReserve(table)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={availableSlots.length === 0}
                >
                    {availableSlots.length === 0
                        ? "Fully Booked"
                        : "View Time Slots"}
                </motion.button>
            </div>
        </motion.div>
    );
};

export default TableCard;
