"use client";
import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { Calendar, Clock, CheckCircle } from "lucide-react";

interface Booking { id: number; date: string; time: string; isBooked: boolean; bookedBy: string; bookedByName: string; }

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI("/slots/my-bookings").then(data => setBookings(Array.isArray(data) ? data : [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
        <p className="text-gray-500 mt-1">Your scheduled appointments</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-2">No bookings yet</p>
          <a href="/appointment" className="text-elvion-primary hover:underline text-sm">Book an appointment</a>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-elvion-primary/10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-elvion-primary" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{new Date(booking.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1"><Clock size={14} /> {booking.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle size={16} /> Confirmed
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
