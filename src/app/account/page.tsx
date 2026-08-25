"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { formatGHS } from "@/lib/currency";

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUser(user);

      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setOrders(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    paid: "bg-blue-50 text-blue-700 border-blue-200",
    shipped: "bg-purple-50 text-purple-700 border-purple-200",
    delivered: "bg-green-50 text-green-700 border-green-200",
  };

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="bg-[var(--border-subtle)] h-8 rounded w-1/4" />
          <div className="bg-[var(--border-subtle)] h-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="font-display text-sm tracking-[0.2em] text-[var(--accent)] mb-2">
          Dashboard
        </p>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight">
          My Account
        </h1>
      </div>

      {/* Profile */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-8 mb-8 animate-slide-up">
        <h2 className="font-display text-sm tracking-[0.2em] text-[var(--fg-muted)] mb-6">
          Profile
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="font-display text-[10px] tracking-[0.2em] text-[var(--fg-muted)] mb-1">
              Email
            </p>
            <p className="text-[var(--fg-primary)]">{user?.email}</p>
          </div>
          <div>
            <p className="font-display text-[10px] tracking-[0.2em] text-[var(--fg-muted)] mb-1">
              Member Since
            </p>
            <p className="text-[var(--fg-primary)]">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-8 animate-slide-up delay-1">
        <h2 className="font-display text-sm tracking-[0.2em] text-[var(--fg-muted)] mb-6">
          Order History
        </h2>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-[var(--border-subtle)] rounded-none flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m7.5 4.27 9 5.15" />
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </div>
            <p className="text-[var(--fg-secondary)]">
              No orders yet. Start building.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-5 border border-[var(--border-subtle)] hover:border-[var(--border)] transition-colors"
              >
                <div>
                  <p className="font-display text-sm tracking-wider">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-[var(--fg-muted)] text-xs mt-1">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-[10px] font-display tracking-[0.15em] px-3 py-1 border ${
                      statusStyles[order.status] ?? "bg-gray-50 text-gray-700"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                  <span className="font-display text-base tracking-tight">
                    {formatGHS(order.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
