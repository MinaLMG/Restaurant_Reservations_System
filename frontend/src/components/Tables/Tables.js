import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Table, Clock, Plus, Eye, Users, Trash2, X } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import TableCard from "./TableCard";
import SlotCard from "./SlotCard";
import ReservationCard from "./ReservationCard";
import "./Tables.css";

const API_URL = process.env.REACT_APP_API_URL;

const Tables = () => {
    const { user } = useAuth();
    const [tables, setTables] = useState([]);
    const [slots, setSlots] = useState([]);
    const [userReservations, setUserReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("tables");
    const [viewMode, setViewMode] = useState("tables");

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showReservationModal, setShowReservationModal] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);

    // Add new state for table/slot selection flow
    const [showSlotSelection, setShowSlotSelection] = useState(false);
    const [showTableSelection, setShowTableSelection] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tablesRes, slotsRes, reservationsRes] = await Promise.all([
                axios.get(`${API_URL}/tables`),
                axios.get(`${API_URL}/slots`),
                axios.get(`${API_URL}/user/reservations`),
            ]);

            setTables(tablesRes.data);
            setSlots(slotsRes.data);
            setUserReservations(reservationsRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTable = async (tableData) => {
        try {
            await axios.post(`${API_URL}/tables`, tableData);
            fetchData();
            setShowCreateModal(false);
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to create table");
        }
    };

    const handleMakeReservation = async (reservationData) => {
        try {
            await axios.post(`${API_URL}/reservations`, reservationData);
            fetchData();
            setShowReservationModal(false);
            setSelectedTable(null);
            setSelectedSlot(null);
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to make reservation");
        }
    };

    const handleCancelReservation = async (reservationId) => {
        try {
            await axios.delete(`${API_URL}/reservations/${reservationId}`);
            fetchData();
        } catch (error) {
            alert(
                error.response?.data?.detail || "Failed to cancel reservation"
            );
        }
    };

    const handleTableSelect = (table) => {
        setSelectedTable(table);
        setShowSlotSelection(true);
    };

    const handleSlotSelect = (slot) => {
        setSelectedSlot(slot);
        setShowTableSelection(true);
    };

    const handleSlotForTableSelect = (slot) => {
        setSelectedSlot(slot);
        setShowReservationModal(true);
        setShowSlotSelection(false);
    };

    const handleTableForSlotSelect = (table) => {
        setSelectedTable(table);
        setShowReservationModal(true);
        setShowTableSelection(false);
    };

    if (loading) {
        return <div className="loading">Loading tables...</div>;
    }

    return (
        <div className="tables-page">
            <div className="tables-container">
                <div className="tables-header">
                    <h1>Table Reservations</h1>
                    <div className="header-actions">
                        <div className="tabs">
                            <button
                                className={`tab ${
                                    activeTab === "tables" ? "active" : ""
                                }`}
                                onClick={() => setActiveTab("tables")}
                            >
                                <Table size={20} />
                                Make a Reservation
                            </button>
                            <button
                                className={`tab ${
                                    activeTab === "reservations" ? "active" : ""
                                }`}
                                onClick={() => setActiveTab("reservations")}
                            >
                                <Eye size={20} />
                                My Reservations
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === "tables" ? (
                        <motion.div
                            key="tables"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="view-selector">
                                <button
                                    className={`view-button ${
                                        viewMode === "tables" ? "active" : ""
                                    }`}
                                    onClick={() => setViewMode("tables")}
                                >
                                    <Table size={20} />
                                    Browse by Tables
                                </button>
                                <button
                                    className={`view-button ${
                                        viewMode === "slots" ? "active" : ""
                                    }`}
                                    onClick={() => setViewMode("slots")}
                                >
                                    <Clock size={20} />
                                    Browse by Time Slots
                                </button>
                            </div>

                            {viewMode === "tables" ? (
                                <div className="tables-grid">
                                    {tables.map((table) => (
                                        <TableCard
                                            key={table.id}
                                            table={table}
                                            slots={slots}
                                            userReservations={userReservations}
                                            onReserve={handleTableSelect}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="slots-grid">
                                    {slots.map((slot) => (
                                        <SlotCard
                                            key={slot.id}
                                            slot={slot}
                                            tables={tables}
                                            userReservations={userReservations}
                                            onReserve={handleSlotSelect}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="reservations"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {userReservations.length === 0 ? (
                                <div className="empty-state">
                                    <Table size={64} />
                                    <h3>No reservations yet</h3>
                                    <p>
                                        You haven't made any table reservations.
                                    </p>
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

                {/* Inline Reservation Modal */}
                {showReservationModal && selectedTable && selectedSlot && (
                    <ReservationModal
                        table={selectedTable}
                        slot={selectedSlot}
                        onClose={() => {
                            setShowReservationModal(false);
                            setSelectedTable(null);
                            setSelectedSlot(null);
                        }}
                        onSubmit={handleMakeReservation}
                    />
                )}

                {/* Slot Selection Modal for selected table */}
                {showSlotSelection && selectedTable && (
                    <SlotSelectionModal
                        table={selectedTable}
                        slots={slots}
                        userReservations={userReservations}
                        onClose={() => {
                            setShowSlotSelection(false);
                            setSelectedTable(null);
                        }}
                        onSelectSlot={handleSlotForTableSelect}
                    />
                )}

                {/* Table Selection Modal for selected slot */}
                {showTableSelection && selectedSlot && (
                    <TableSelectionModal
                        slot={selectedSlot}
                        tables={tables}
                        userReservations={userReservations}
                        onClose={() => {
                            setShowTableSelection(false);
                            setSelectedSlot(null);
                        }}
                        onSelectTable={handleTableForSlotSelect}
                    />
                )}
            </div>
        </div>
    );
};

// Inline Modal Components
const ReservationModal = ({ table, slot, onClose, onSubmit }) => {
    const [capacity, setCapacity] = useState(1);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            table_id: table.id,
            slot_id: slot.id,
            capacity: parseInt(capacity),
        });
    };

    const formatDateTime = (dateTimeString) => {
        return new Date(dateTimeString).toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Make Reservation</h2>
                    <button onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="reservation-details">
                    <p>
                        <Table size={16} /> Table {table.table_no}
                    </p>
                    <p>
                        <Clock size={16} /> {formatDateTime(slot.start_time)} -{" "}
                        {formatDateTime(slot.end_time)}
                    </p>
                    <p>
                        <Users size={16} /> Max capacity: {table.capacity}
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Number of Guests</label>
                        <input
                            type="number"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            min="1"
                            max={table.capacity}
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit">Confirm Reservation</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SlotSelectionModal = ({
    table,
    slots,
    userReservations,
    onClose,
    onSelectSlot,
}) => {
    const formatDateTime = (dateTimeString) => {
        return new Date(dateTimeString).toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Select Time Slot for Table {table.table_no}</h2>
                    <button onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="slots-list">
                    {slots.map((slot) => {
                        const isReserved = userReservations.some(
                            (res) =>
                                res.table_id === table.id &&
                                res.slot_id === slot.id
                        );

                        return (
                            <div
                                key={slot.id}
                                className={`slot-option ${
                                    isReserved ? "chosen" : ""
                                }`}
                                onClick={() =>
                                    !isReserved && onSelectSlot(slot)
                                }
                            >
                                <Clock size={16} />
                                <span>
                                    {formatDateTime(slot.start_time)} -{" "}
                                    {formatDateTime(slot.end_time)}
                                </span>
                                {isReserved && (
                                    <span className="reserved-label">
                                        Reserved
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const TableSelectionModal = ({
    slot,
    tables,
    userReservations,
    onClose,
    onSelectTable,
}) => {
    const formatDateTime = (dateTimeString) => {
        return new Date(dateTimeString).toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        Select Table for {formatDateTime(slot.start_time)} -{" "}
                        {formatDateTime(slot.end_time)}
                    </h2>
                    <button onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="tables-list">
                    {tables.map((table) => {
                        const isReserved = userReservations.some(
                            (res) =>
                                res.table_id === table.id &&
                                res.slot_id === slot.id
                        );

                        return (
                            <div
                                key={table.id}
                                className={`table-option ${
                                    isReserved ? "chosen" : ""
                                }`}
                                onClick={() =>
                                    !isReserved && onSelectTable(table)
                                }
                            >
                                <Table size={16} />
                                <span>
                                    Table {table.table_no} (Seats{" "}
                                    {table.capacity})
                                </span>
                                {isReserved && (
                                    <span className="reserved-label">
                                        Reserved
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Tables;
