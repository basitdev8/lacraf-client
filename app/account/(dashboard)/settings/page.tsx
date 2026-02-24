"use client";

import { useState, type FormEvent } from "react";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { customerApi } from "@/lib/customer-api";
import type { Customer } from "@/lib/customer-types";

export default function SettingsPage() {
  const { customer, setCustomer } = useCustomerAuth();

  // Profile form
  const [profile, setProfile] = useState({
    fullName: customer?.fullName || "",
    phone: customer?.phone || "",
  });
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Password form
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileMsg("");
    setProfileSubmitting(true);

    try {
      const data = await customerApi.patch<{
        message: string;
        customer: Customer;
      }>("/customer/auth/profile", {
        fullName: profile.fullName,
        phone: profile.phone || undefined,
      });
      setCustomer(data.customer);
      setProfileMsg(data.message);
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMsg("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwords.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    setPasswordSubmitting(true);

    try {
      const data = await customerApi.post<{ message: string }>(
        "/customer/auth/change-password",
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }
      );
      setPasswordMsg(data.message);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to change password"
      );
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Account Settings</h1>
      <p className="mt-1 text-sm text-muted">
        Update your profile and security settings
      </p>

      {/* Profile Section */}
      <div className="mt-8 rounded-2xl border border-border bg-white p-6">
        <h2 className="text-lg font-semibold">Profile</h2>
        <p className="mt-0.5 text-xs text-muted">
          Update your personal information
        </p>

        <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Full Name
              </label>
              <input
                type="text"
                required
                className="input-underline"
                value={profile.fullName}
                onChange={(e) =>
                  setProfile({ ...profile, fullName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Phone
              </label>
              <input
                type="tel"
                className="input-underline"
                placeholder="+91 98765 43210"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Email
            </label>
            <input
              type="email"
              disabled
              className="input-underline opacity-50 cursor-not-allowed"
              value={customer?.email || ""}
            />
            <p className="mt-1 text-[11px] text-muted">
              Email cannot be changed
            </p>
          </div>

          {profileError && (
            <p className="rounded-lg bg-error/5 px-4 py-2.5 text-sm text-error">
              {profileError}
            </p>
          )}

          {profileMsg && (
            <p className="rounded-lg bg-success/5 px-4 py-2.5 text-sm text-success">
              {profileMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={profileSubmitting}
            className="btn-brand"
          >
            {profileSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className="mt-6 rounded-2xl border border-border bg-white p-6">
        <h2 className="text-lg font-semibold">Change Password</h2>
        <p className="mt-0.5 text-xs text-muted">
          Update your password to keep your account secure
        </p>

        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Current Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              className="input-underline"
              placeholder="••••••••"
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, currentPassword: e.target.value })
              }
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                New Password
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                className="input-underline"
                placeholder="Min 8 characters"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                className="input-underline"
                placeholder="Re-enter password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {passwordError && (
            <p className="rounded-lg bg-error/5 px-4 py-2.5 text-sm text-error">
              {passwordError}
            </p>
          )}

          {passwordMsg && (
            <p className="rounded-lg bg-success/5 px-4 py-2.5 text-sm text-success">
              {passwordMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={passwordSubmitting}
            className="btn-brand"
          >
            {passwordSubmitting ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
