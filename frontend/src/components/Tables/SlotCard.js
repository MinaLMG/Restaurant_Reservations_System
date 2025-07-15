import React from "react";
import { motion } from "framer-motion";
import { Clock, Table, Users } from "lucide-react";
import "./Tables.css";

const SlotCard = ({ slot, tables, onReserve, userReservations }) => {
    const availableTables = tables.filter(
        (table) =>
            !userReservations.some(
                (res) => res.table_id === table.id && res.slot_id === slot.id
            )
    );

    const formatTime = (dateTimeString) => {
        return new Date(dateTimeString).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <motion.div
            className="slot-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <div className="slot-header">
                <div className="slot-icon">
                    <Clock size={32} />
                </div>
                <div className="slot-time">
                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                </div>
            </div>

            <div className="slot-content">
                <div className="slot-info">
                    <div className="info-item">
                        <Table size={16} />
                        <span>{availableTables.length} tables available</span>
                    </div>
                    <div className="info-item">
                        <Users size={16} />
                        <span>
                            Total capacity:{" "}
                            {availableTables.reduce(
                                (sum, table) => sum + table.capacity,
                                0
                            )}
                        </span>
                    </div>
                </div>

                <div className="tables-preview">
                    {availableTables.slice(0, 3).map((table) => (
                        <div key={table.id} className="mini-table">
                            <Table size={16} />
                            <span>{table.table_no}</span>
                        </div>
                    ))}
                    {availableTables.length > 3 && (
                        <div className="more-tables">
                            +{availableTables.length - 3} more
                        </div>
                    )}
                </div>
            </div>

            <div className="slot-actions">
                <motion.button
                    className="select-button"
                    onClick={() => onReserve(slot)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={availableTables.length === 0}
                >
                    {availableTables.length === 0
                        ? "Fully Booked"
                        : "View Tables"}
                </motion.button>
            </div>
        </motion.div>
    );
};

export default SlotCard;
