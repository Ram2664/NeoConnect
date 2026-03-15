"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableCell, TableHead } from "@/components/ui/table";
import { apiRequest, publicRequest } from "@/lib/api";
import { clearAuthData } from "@/lib/auth";
import { getDashboardDescription } from "@/lib/dashboard";
import { formatDate, getStatusVariant } from "@/lib/format";
import { useProtectedPage } from "@/lib/useProtectedPage";

export default function RoleDashboard() {
  const router = useRouter();
  const { user, loading, allowed } = useProtectedPage();
  const [pageLoading, setPageLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [polls, setPolls] = useState([]);
  const [minutes, setMinutes] = useState([]);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!allowed || !user) return;
    loadDashboardData();
  }, [allowed, user]);

  async function loadDashboardData() {
    setPageLoading(true);
    setError("");

    try {
      const complaintPromise = apiRequest("/complaints");
      const pollPromise = apiRequest("/polls");
      const minutePromise =
        user.role === "Secretariat" || user.role === "Admin"
          ? publicRequest("/minutes")
          : Promise.resolve([]);
      const userPromise = user.role === "Admin" ? apiRequest("/users") : Promise.resolve([]);
      const settingPromise = user.role === "Admin" ? apiRequest("/settings") : Promise.resolve([]);

      const [complaintData, pollData, minuteData, userData, settingData] = await Promise.all([
        complaintPromise,
        pollPromise,
        minutePromise,
        userPromise,
        settingPromise
      ]);

      setComplaints(complaintData);
      setPolls(pollData);
      setMinutes(minuteData);
      setUsers(userData);
      setSettings(settingData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPageLoading(false);
    }
  }

  async function handleDeleteUser(selectedUser) {
    if (!window.confirm(`Are you sure you want to permanently delete the user ${selectedUser.name}?`)) {
      return;
    }

    setMessage("");
    setError("");
    try {
      await apiRequest(`/users/${selectedUser._id}`, {
        method: "DELETE"
      });
      setMessage("User permanently deleted.");
      loadDashboardData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleToggleUser(selectedUser) {
    setMessage("");
    setError("");
    try {
      await apiRequest(`/users/${selectedUser._id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !selectedUser.isActive })
      });
      setMessage("User status updated.");
      loadDashboardData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }


  async function handleSaveSettings() {
    setMessage("");
    setError("");
    try {
      await apiRequest("/settings", {
        method: "PATCH",
        body: JSON.stringify({
          settings: settings.map((item) => ({
            key: item.key,
            label: item.label,
            value: item.value
          }))
        })
      });
      setMessage("Settings saved.");
      loadDashboardData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function updateSettingValue(key, value) {
    setSettings((curr) =>
      curr.map((item) => (item.key === key ? { ...item, value } : item))
    );
  }

  function handleLogout() {
    clearAuthData();
    router.push("/login");
  }

  function buildStats() {
    const openCases = complaints.filter((item) => item.status !== "Resolved").length;
    const activePolls = polls.filter((item) => item.active).length;

    if (user.role === "Staff") {
      return [
        { label: "My Complaints", value: complaints.length },
        { label: "Open Complaints", value: openCases },
        { label: "Active Polls", value: activePolls },
        { label: "Public Updates", value: complaints.filter(item => item.publicUpdate).length }
      ];
    }
    if (user.role === "Secretariat") {
      return [
        { label: "All Cases", value: complaints.length },
        { label: "New Cases", value: complaints.filter(item => item.status === "New").length },
        { label: "Escalated", value: complaints.filter(item => item.status === "Escalated").length },
        { label: "Active Polls", value: polls.filter(item => item.active).length }
      ];
    }
    if (user.role === "Case Manager") {
      return [
        { label: "Assigned To Me", value: complaints.length },
        { label: "In Progress", value: complaints.filter(item => item.status === "In Progress").length },
        { label: "Pending", value: complaints.filter(item => item.status === "Pending").length },
        { label: "Resolved", value: complaints.filter(item => item.status === "Resolved").length }
      ];
    }
    return [
      { label: "Total Cases", value: complaints.length },
      { label: "System Users", value: users.length },
      { label: "Open Polls", value: activePolls },
      { label: "Settings", value: settings.length }
    ];
  }

  function getQuickLinks() {
    let links = [];
    if (user.role === "Staff") {
      links.push({ label: "Submit Complaint", href: "/submit-complaint" });
      links.push({ label: "Staff Polls", href: "/polls" });
      links.push({ label: "Public Hub", href: "/public-hub" });
    }
    if (user.role === "Secretariat") {
      links.push({ label: "Manage Cases", href: "/cases" });
      links.push({ label: "Poll Management", href: "/polls" });
      links.push({ label: "Upload Minutes", href: "/public-hub" });
      links.push({ label: "Analytics", href: "/analytics" });
    }
    if (user.role === "Case Manager") {
      links.push({ label: "Assigned Cases", href: "/cases" });
    }
    if (user.role === "Admin") {
      links.push({ label: "User Management", href: "#" });
    }
    return links;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <p className="text-slate-500">Loading your workspace...</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <p className="text-red-600">You do not have permission to view this page.</p>
      </div>
    );
  }

  const stats = buildStats();
  const quickLinks = getQuickLinks();
  const recentItems = complaints.slice(0, 5);

  return (
    <AppShell
      user={user}
      title={`Welcome back, ${user.name}`}
    >
      <div className="space-y-8">
        {/* Alerts */}
        {(message || error) && (
          <div className="bg-white p-4 rounded-md border border-slate-200">
            {message && <p className="text-sm font-medium text-emerald-600">{message}</p>}
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          </div>
        )}

        {/* Stats Grid */}
        {user.role !== "Admin" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500 mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {user.role !== "Admin" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Recent Activity</h2>
              </div>
              
              {pageLoading ? (
                <p className="text-sm text-slate-500">Loading items...</p>
              ) : recentItems.length === 0 ? (
                <p className="text-sm text-slate-500">No recent activity found.</p>
              ) : (
                <div className="space-y-4">
                  {recentItems.map((item) => (
                    <div key={item._id} className="flex justify-between items-start border-b border-slate-100 pb-4 last:border-0 last:pb-0 relative group">
                      <div>
                        <Link href={`/case/${item._id}`} className="font-medium text-slate-900 hover:text-brand-700 before:absolute before:inset-0">
                          {item.title}
                        </Link>
                        <p className="text-sm text-slate-500 mt-1">
                          <Link href={`/case/${item._id}`} className="text-brand-700 hover:text-brand-800 hover:underline">
                            {item.trackingId} <span className="text-xs">→ View Case</span>
                          </Link> • {item.department} • {formatDate(item.createdAt)}
                        </p>
                      </div>
                      <div className="z-10 relative">
                        <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Center */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Action Center</h2>
              </div>
              
              <div className="flex flex-col gap-3">
                {quickLinks.map((link, idx) => (
                  <Link key={idx} href={link.href} className="flex flex-col items-start gap-1 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                    <span className="font-medium text-slate-900">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Admin Tools */}
        {user.role === "Admin" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">User Management</h2>
              </div>
              
              {users.length === 0 ? (
                <p className="text-sm text-slate-500">No users found.</p>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((acc) => (
                      <tr key={acc._id}>
                        <TableCell>
                          <p className="font-medium text-slate-900">{acc.name}</p>
                          <p className="text-xs text-slate-500">{acc.email}</p>
                        </TableCell>
                        <TableCell>{acc.role}</TableCell>
                        <TableCell>{acc.isActive ? "Active" : "Inactive"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleToggleUser(acc)}>
                              {acc.isActive ? "Disable" : "Enable"}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(acc)}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>



            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">System Settings</h2>
              </div>
              
              <div className="space-y-4">
                {settings.map((item) => (
                  <div key={item.key} className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">{item.label}</label>
                    <Input
                      value={item.value}
                      onChange={(e) => updateSettingValue(item.key, e.target.value)}
                    />
                  </div>
                ))}
                <div className="pt-2">
                  <Button onClick={handleSaveSettings} className="w-full">Save Settings</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
