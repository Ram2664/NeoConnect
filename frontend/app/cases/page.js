"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableCell, TableHead } from "@/components/ui/table";
import { apiRequest } from "@/lib/api";
import { formatDate, getStatusVariant } from "@/lib/format";
import { useProtectedPage } from "@/lib/useProtectedPage";

const allowedRoles = ["Staff", "Secretariat", "Case Manager"];

export default function CasesPage() {
  const { user, loading, allowed } = useProtectedPage(allowedRoles);
  const [cases, setCases] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!allowed) {
      return;
    }

    loadCases();
  }, [allowed]);

  async function loadCases() {
    setPageLoading(true);
    setError("");

    try {
      const data = await apiRequest("/complaints");
      setCases(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPageLoading(false);
    }
  }

  if (loading) {
    return (
      <AppShell title="Cases" description="Loading cases...">
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Checking access...</p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  if (!allowed) {
    return (
      <AppShell title="Cases" description="Only management, case managers, and admin can use this page.">
        <Card>
          <CardContent>
            <p className="text-sm text-red-700">You do not have access to the case inbox.</p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const filteredCases =
    selectedStatus === "All"
      ? cases
      : cases.filter((item) => item.status === selectedStatus);

  return (
    <AppShell
      user={user}
      title={user.role === "Staff" ? "My Complaints" : "Case Inbox"}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Total visible cases</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{cases.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Open cases</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {cases.filter((item) => item.status !== "Resolved").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Escalated cases</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {cases.filter((item) => item.status === "Escalated").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Inbox view</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 max-w-xs">
            <label className="mb-2 block text-sm font-medium text-slate-700">Filter by status</label>
            <Select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
              <option value="All">All</option>
              <option value="New">New</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Escalated">Escalated</option>
            </Select>
          </div>

          {error && <p className="mb-4 text-sm text-red-700">{error}</p>}

          {pageLoading ? (
            <p className="text-sm text-slate-500">Loading cases...</p>
          ) : filteredCases.length === 0 ? (
            <p className="text-sm text-slate-500">No cases match this filter.</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <TableHead>Tracking ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned to</TableHead>
                  <TableHead>Created</TableHead>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((item) => (
                  <tr key={item._id}>
                    <TableCell>
                      <Link href={`/case/${item._id}`} className="font-medium text-brand-700 hover:text-brand-800 hover:underline">
                        {item.trackingId} <span className="text-xs text-slate-400">→ View Details</span>
                      </Link>
                    </TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.department}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                    </TableCell>
                    <TableCell>{item.assignedTo?.name || "Not assigned"}</TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
