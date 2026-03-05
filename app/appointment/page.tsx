"use client";
import { Button } from "@/components/Button";
import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface Slot {
    id: number;
    date: string;
    time: string;
    is_booked: boolean;
    booked_by?: string | null;
    booked_by_name?: string | null;
}

export default function Appointment() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [myBookings, setMyBookings] = useState<Slot[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [loadingMyBookings, setLoadingMyBookings] = useState(true);

    useEffect(() => {
        const loadSlots = async () => {
            try {
                const data = await fetchAPI("/slots/");
                setSlots(data);
            } catch (error) {
                console.error("Failed to load slots", error);
            } finally {
                setLoadingSlots(false);
            }
        };
        loadSlots();
    }, []);

    useEffect(() => {
        const loadMyBookings = async () => {
            if (!isAuthenticated) {
                setLoadingMyBookings(false);
                return;
            }
            try {
                const data = await fetchAPI("/slots/my-bookings");
                setMyBookings(data);
            } catch (error) {
                console.error("Failed to load my bookings", error);
            } finally {
                setLoadingMyBookings(false);
            }
        };
        loadMyBookings();
    }, [isAuthenticated]);

    const availableSlots = slots.filter(
        (slot) => slot.date === selectedDate && !slot.is_booked
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlotId || !isAuthenticated) return;

        try {
            await fetchAPI(`/slots/${selectedSlotId}/book`, {
                method: "PUT",
            });
            setSubmitted(true);
            // Refresh slots and my bookings
            const data = await fetchAPI("/slots/");
            setSlots(data);
            const myBookingsData = await fetchAPI("/slots/my-bookings");
            setMyBookings(myBookingsData);
        } catch (error) {
            console.error("Booking failed:", error);
            alert(t("appointment.bookingFailed"));
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-elvion-dark px-4">
                <div className="text-center p-8 bg-elvion-card rounded-2xl border border-elvion-primary animate-in fade-in zoom-in">
                    <h2 className="text-2xl font-bold text-white mb-2">{t("appointment.confirmed.title")}</h2>
                    <p className="text-elvion-gray">{t("appointment.confirmed.desc")}</p>
                    <Button onClick={() => { setSubmitted(false); setSelectedSlotId(null); }} className="mt-4">{t("appointment.confirmed.bookAnother")}</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10 px-4 max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-white">{t("appointment.title")}</h1>
                <p className="text-elvion-gray mt-2">{t("appointment.description")}</p>
            </div>

            {/* My Bookings Section */}
            {isAuthenticated && (
                <div className="bg-elvion-card p-6 rounded-2xl border border-white/10 shadow-2xl mb-6">
                    <h2 className="text-2xl font-bold text-white mb-4">{t("appointment.myBookings")}</h2>
                    {loadingMyBookings ? (
                        <div className="text-center text-gray-400 py-4">{t("appointment.loadingBookings")}</div>
                    ) : myBookings.length === 0 ? (
                        <div className="text-center py-6 text-gray-400">
                            <p>{t("appointment.noBookings")}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myBookings.map((booking) => (
                                <div key={booking.id} className="bg-elvion-dark p-4 rounded-xl border border-white/10">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-elvion-primary text-sm font-semibold">{booking.date}</p>
                                            <p className="text-white text-xl font-bold mt-1">{booking.time}</p>
                                        </div>
                                        <span className="text-xs px-3 py-1 rounded bg-elvion-primary/20 text-elvion-primary">
                                            Confirmed
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="bg-elvion-card p-8 rounded-2xl border border-white/10 shadow-2xl">
                {isLoading ? (
                    <div className="text-center text-gray-400 py-8">{t("appointment.checkingAuth")}</div>
                ) : !isAuthenticated ? (
                    <div className="text-center py-8">
                        <p className="text-white text-lg mb-4">{t("appointment.loginRequired")}</p>
                        <Link href="/login">
                            <Button className="w-full md:w-auto">{t("appointment.loginButton")}</Button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-white mb-2 font-medium">{t("appointment.selectDate")}</label>
                            <input
                                type="date"
                                required
                                className="w-full bg-elvion-dark border border-white/20 p-3 rounded-lg text-white color-scheme-dark"
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    setSelectedSlotId(null);
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-white mb-2 font-medium">{t("appointment.availableSlots")}</label>
                            {loadingSlots ? (
                                <p className="text-gray-400">{t("appointment.loadingSlots")}</p>
                            ) : availableSlots.length === 0 ? (
                                <p className="text-gray-400">{selectedDate ? t("appointment.noSlots") : t("appointment.selectDateFirst")}</p>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {availableSlots.map((slot) => (
                                        <div
                                            key={slot.id}
                                            onClick={() => setSelectedSlotId(slot.id)}
                                            className={`p-3 rounded-lg text-center cursor-pointer border transition-all ${selectedSlotId === slot.id
                                                ? "bg-elvion-primary text-black border-elvion-primary font-bold"
                                                : "bg-elvion-dark text-gray-300 border-white/10 hover:border-elvion-primary/50"
                                                }`}
                                        >
                                            {slot.time}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <p className="text-sm text-gray-400 mb-4">
                                {t("appointment.bookingAs")} <span className="text-white font-semibold">{user?.name || user?.email}</span>
                            </p>

                            <Button type="submit" disabled={!selectedSlotId || !selectedDate} className="w-full disabled:opacity-50">
                                {t("appointment.confirmButton")}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
