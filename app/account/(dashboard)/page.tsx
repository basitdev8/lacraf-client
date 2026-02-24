"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { customerApi } from "@/lib/customer-api";
import type { Order } from "@/lib/customer-types";

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-50 text-yellow-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  CRAFTING: "bg-purple-50 text-purple-700",
  PROCESSING: "bg-indigo-50 text-indigo-700",
  SHIPPED: "bg-cyan-50 text-cyan-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
  REFUNDED: "bg-gray-50 text-gray-700",
};

export default function AccountOverviewPage() {
  const { customer } = useCustomerAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    customerApi
      .get<{ orders: Order[] }>("/orders", { limit: 3 })
      .then((data) => setRecentOrders(data.orders))
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, []);

  const firstName = customer?.fullName.split(" ")[0] || "there";

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Welcome, {firstName}</h1>
        <p className="mt-1 text-sm text-muted">
          Manage your orders, addresses, and account settings.
        </p>
      </div>

      {/* Quick actions */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/shop/handloom"
          className="group rounded-2xl border border-border bg-white p-5 transition-all hover:border-brand hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light">
            <svg
              className="h-5 w-5 text-brand-dark"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
          </div>
          <p className="mt-3 text-sm font-semibold">Browse Products</p>
          <p className="mt-0.5 text-xs text-muted">
            Explore handcrafted collections
          </p>
        </Link>

        <Link
          href="/account/orders"
          className="group rounded-2xl border border-border bg-white p-5 transition-all hover:border-brand hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light">
            <svg
              className="h-5 w-5 text-brand-dark"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <p className="mt-3 text-sm font-semibold">View Orders</p>
          <p className="mt-0.5 text-xs text-muted">
            Track and manage your orders
          </p>
        </Link>

        <Link
          href="/account/addresses"
          className="group rounded-2xl border border-border bg-white p-5 transition-all hover:border-brand hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light">
            <svg
              className="h-5 w-5 text-brand-dark"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <p className="mt-3 text-sm font-semibold">Manage Addresses</p>
          <p className="mt-0.5 text-xs text-muted">
            Add or edit delivery addresses
          </p>
        </Link>
      </div>

      {/* Recent orders */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link
            href="/account/orders"
            className="text-xs font-medium text-brand-dark hover:underline"
          >
            View all
          </Link>
        </div>

        {ordersLoading ? (
          <div className="rounded-2xl border border-border bg-white p-8">
            <div className="flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
            </div>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-8 text-center">
            <p className="text-sm text-muted">No orders yet.</p>
            <Link
              href="/shop/handloom"
              className="mt-3 inline-block text-sm font-medium text-brand-dark hover:underline"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between rounded-2xl border border-border bg-white px-5 py-4 transition-all hover:border-brand/30 hover:shadow-sm"
              >
                <div>
                  <p className="text-sm font-medium">
                    Order #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    &middot; {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                      STATUS_COLORS[order.status] || "bg-gray-50 text-gray-700"
                    }`}
                  >
                    {order.status.replace(/_/g, " ")}
                  </span>
                  <p className="text-sm font-semibold">
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
