"use client";

import { useState, useEffect, type FormEvent } from "react";
import { customerApi } from "@/lib/customer-api";
import type { CustomerAddress } from "@/lib/customer-types";

const EMPTY_FORM = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAddresses = async () => {
    try {
      const data = await customerApi.get<{ addresses: CustomerAddress[] }>(
        "/addresses"
      );
      setAddresses(data.addresses);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (addr: CustomerAddress) => {
    setForm({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setEditingId(addr.id);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        addressLine2: form.addressLine2 || undefined,
      };

      if (editingId) {
        await customerApi.patch(`/addresses/${editingId}`, payload);
      } else {
        await customerApi.post("/addresses", payload);
      }
      closeForm();
      await fetchAddresses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await customerApi.delete(`/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // silently fail
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await customerApi.post(`/addresses/${id}/set-default`);
      await fetchAddresses();
    } catch {
      // silently fail
    }
  };

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Addresses</h1>
          <p className="mt-1 text-sm text-muted">
            Manage your delivery addresses
          </p>
        </div>
        {!showForm && (
          <button onClick={openAddForm} className="btn-brand text-sm">
            Add Address
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="mt-6 rounded-2xl border border-border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {editingId ? "Edit Address" : "Add New Address"}
            </h2>
            <button
              onClick={closeForm}
              className="text-xs text-muted hover:text-foreground"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="input-underline"
                  placeholder="Recipient's name"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  className="input-underline"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Address Line 1
              </label>
              <input
                type="text"
                required
                className="input-underline"
                placeholder="House/Flat no., Street"
                value={form.addressLine1}
                onChange={(e) => update("addressLine1", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Address Line 2{" "}
                <span className="text-muted/60 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                className="input-underline"
                placeholder="Landmark, Area"
                value={form.addressLine2}
                onChange={(e) => update("addressLine2", e.target.value)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">
                  City
                </label>
                <input
                  type="text"
                  required
                  className="input-underline"
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">
                  State
                </label>
                <input
                  type="text"
                  required
                  className="input-underline"
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">
                  Pincode
                </label>
                <input
                  type="text"
                  required
                  className="input-underline"
                  placeholder="110001"
                  value={form.pincode}
                  onChange={(e) => update("pincode", e.target.value)}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => update("isDefault", e.target.checked)}
                className="h-4 w-4 rounded border-border accent-brand"
              />
              <span className="text-sm text-muted">
                Set as default address
              </span>
            </label>

            {error && (
              <p className="rounded-lg bg-error/5 px-4 py-2.5 text-center text-sm text-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-brand"
            >
              {submitting
                ? "Saving..."
                : editingId
                ? "Update Address"
                : "Save Address"}
            </button>
          </form>
        </div>
      )}

      {/* Address cards */}
      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
          </div>
        ) : addresses.length === 0 && !showForm ? (
          <div className="rounded-2xl border border-border bg-white py-12 text-center">
            <svg
              className="mx-auto h-10 w-10 text-muted/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
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
            <p className="mt-3 text-sm text-muted">No addresses saved yet.</p>
            <button
              onClick={openAddForm}
              className="mt-3 text-sm font-medium text-brand-dark hover:underline"
            >
              Add your first address
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="rounded-2xl border border-border bg-white p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">{addr.fullName}</p>
                    <p className="mt-0.5 text-xs text-muted">{addr.phone}</p>
                  </div>
                  {addr.isDefault && (
                    <span className="rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-dark">
                      Default
                    </span>
                  )}
                </div>

                <div className="mt-3 text-sm text-muted">
                  <p>{addr.addressLine1}</p>
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  <p>
                    {addr.city}, {addr.state} {addr.pincode}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-3 border-t border-border pt-3">
                  <button
                    onClick={() => openEditForm(addr)}
                    className="text-xs font-medium text-brand-dark hover:underline"
                  >
                    Edit
                  </button>
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs font-medium text-muted hover:text-foreground"
                    >
                      Set as default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-xs font-medium text-error hover:underline ml-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
