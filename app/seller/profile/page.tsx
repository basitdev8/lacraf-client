"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import type { Shop } from "@/lib/types";

export default function ProfilePage() {
  const { artisan } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  // Shop edit state
  const [editing, setEditing] = useState(false);
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [shopError, setShopError] = useState("");
  const [shopSuccess, setShopSuccess] = useState(false);

  useEffect(() => {
    api
      .get<Shop>("/shop/me")
      .then((s) => {
        setShop(s);
        setShopName(s.shopName);
        setAddress(s.address);
        setDescription(s.description);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveShop(e: React.FormEvent) {
    e.preventDefault();
    setShopError("");
    setShopSuccess(false);
    if (!shopName.trim() || shopName.trim().length < 2)
      return setShopError("Shop name must be at least 2 characters.");
    if (!address.trim() || address.trim().length < 5)
      return setShopError("Address must be at least 5 characters.");
    if (!description.trim() || description.trim().length < 50)
      return setShopError("Description must be at least 50 characters.");

    setSaving(true);
    try {
      const updated = await api.patch<Shop>("/shop/update", {
        shopName: shopName.trim(),
        address: address.trim(),
        description: description.trim(),
      });
      setShop(updated);
      setEditing(false);
      setShopSuccess(true);
      setTimeout(() => setShopSuccess(false), 3000);
    } catch (err) {
      setShopError(
        err instanceof Error ? err.message : "Failed to update shop."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-muted">
          Your account information and shop settings.
        </p>
      </div>

      {/* Artisan Profile (read-only) */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Account Info
          </h2>
          <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
            Approved
          </span>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-xl font-bold">
            {artisan?.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-lg">{artisan?.fullName}</p>
            <p className="text-sm text-muted">{artisan?.email}</p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
              Phone
            </dt>
            <dd className="mt-1 text-sm">{artisan?.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
              Category
            </dt>
            <dd className="mt-1 text-sm capitalize">
              {artisan?.category.toLowerCase() ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
              Gender
            </dt>
            <dd className="mt-1 text-sm capitalize">
              {artisan?.gender?.toLowerCase().replace(/_/g, " ") ?? "Not set"}
            </dd>
          </div>
          {artisan?.village && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                Village
              </dt>
              <dd className="mt-1 text-sm">{artisan.village}</dd>
            </div>
          )}
          {artisan?.district && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                District
              </dt>
              <dd className="mt-1 text-sm">{artisan.district}</dd>
            </div>
          )}
          {artisan?.state && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                State
              </dt>
              <dd className="mt-1 text-sm">{artisan.state}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
              Member Since
            </dt>
            <dd className="mt-1 text-sm">
              {artisan
                ? new Date(artisan.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Shop Details */}
      {shop && (
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Shop Details
            </h2>
            {!editing && (
              <button
                onClick={() => {
                  setShopName(shop.shopName);
                  setAddress(shop.address);
                  setDescription(shop.description);
                  setEditing(true);
                  setShopError("");
                }}
                className="text-xs text-brand-dark underline underline-offset-2"
              >
                Edit
              </button>
            )}
          </div>

          {shopSuccess && (
            <p className="mb-4 rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
              Shop details updated successfully.
            </p>
          )}

          {editing ? (
            <form onSubmit={handleSaveShop} className="space-y-5">
              {shopError && (
                <p className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
                  {shopError}
                </p>
              )}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                  Shop Name *
                </label>
                <input
                  className="input-underline"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  maxLength={150}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                  Address / Location *
                </label>
                <input
                  className="input-underline"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  maxLength={255}
                  placeholder="Village, District, State"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                  Shop Story / Description *
                </label>
                <textarea
                  className="textarea-underline"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={2000}
                />
                <p className="mt-1 text-right text-xs text-muted">
                  {description.length}/2000
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-brand"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Shop Name
                </dt>
                <dd className="mt-1 font-medium">{shop.shopName}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Location
                </dt>
                <dd className="mt-1 text-sm">{shop.address}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Shop Story
                </dt>
                <dd className="mt-1 text-sm text-muted">{shop.description}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Created
                </dt>
                <dd className="mt-1 text-sm text-muted">
                  {new Date(shop.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </dd>
              </div>
            </dl>
          )}
        </div>
      )}
    </div>
  );
}
