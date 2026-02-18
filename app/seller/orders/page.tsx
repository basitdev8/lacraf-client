"use client";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="mt-1 text-sm text-muted">
          Manage and fulfil customer orders from your shop.
        </p>
      </div>

      {/* Coming Soon */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-light">
          <svg
            className="h-7 w-7 text-brand-dark"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">Orders coming soon</h2>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Order management is being built. Once your products are live and
          customers start purchasing, all orders will appear here.
        </p>
        <div className="mt-6 flex flex-col items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            What&apos;s coming
          </p>
          <ul className="mt-1 space-y-1 text-sm text-muted">
            <li>✓ View incoming orders</li>
            <li>✓ Update order status</li>
            <li>✓ Customer contact details</li>
            <li>✓ Order history and earnings</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
