"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { API_URL, apiRequest } from "@/lib/api";
import { formatDate, formatDateTime, getStatusVariant } from "@/lib/format";
import { useProtectedPage } from "@/lib/useProtectedPage";

const allowedRoles = ["Staff", "Secretariat", "Case Manager"];

export default function CaseDetailPage() {
  const params = useParams();
  const { user, loading, allowed } = useProtectedPage(allowedRoles);
  const [complaint, setComplaint] = useState(null);
  const [caseManagers, setCaseManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");
  const [status, setStatus] = useState("Assigned");
  const [note, setNote] = useState("");
  const [publicUpdate, setPublicUpdate] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!allowed || !params.id || !user) {
      return;
    }

    loadCase();
  }, [allowed, params.id, user]);

  // Helper function to get valid next statuses based on case lifecycle
  function getValidNextStatuses(currentStatus) {
    const validTransitions = {
      "New": ["Assigned"], // Secretariat assigns to Case Manager
      "Assigned": ["In Progress", "Escalated"], // Case Manager starts work or escalates
      "In Progress": ["Pending", "Resolved", "Escalated"], // Case Manager can pause, resolve, or escalate
      "Pending": ["In Progress", "Resolved", "Escalated"], // Case Manager can resume, resolve, or escalate
      "Resolved": [], // Final state - no further transitions
      "Escalated": ["Resolved"] // Management can only resolve escalated cases
    };
    
    return validTransitions[currentStatus] || [];
  }

  // Helper function to get status description
  function getStatusDescription(status) {
    const descriptions = {
      "New": "Submission just came in, not yet reviewed",
      "Assigned": "Secretariat has assigned it to a Case Manager", 
      "In Progress": "Case Manager is actively working on it",
      "Pending": "Waiting on more information from the staff member",
      "Resolved": "Case has been addressed and closed",
      "Escalated": "7-day rule triggered — no response from Case Manager, Management has been alerted"
    };
    
    return descriptions[status] || "";
  }

  async function loadCase() {
    setPageLoading(true);
    setError("");

    try {
      const complaintData = await apiRequest(`/complaints/${params.id}`);
      setComplaint(complaintData);
      setSelectedManager(complaintData.assignedTo?._id || "");
      setStatus(complaintData.status || "Assigned");
      setPublicUpdate(complaintData.publicUpdate || "");

      if (user.role === "Secretariat" || user.role === "Admin") {
        const managers = await apiRequest("/users?role=Case%20Manager");
        setCaseManagers(managers.filter((item) => item.isActive));
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPageLoading(false);
    }
  }

  async function handleAssign(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await apiRequest(`/complaints/${params.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          assignedTo: selectedManager
        })
      });

      setMessage("Case assignment updated.");
      loadCase();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleCaseUpdate(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await apiRequest(`/complaints/${params.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          note,
          publicUpdate
        })
      });

      setMessage("Case updated successfully.");
      setNote("");
      loadCase();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (loading) {
    return (
      <AppShell title="Case detail" description="Loading case...">
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
      <AppShell title="Case detail" description="Only approved roles can use this page.">
        <Card>
          <CardContent>
            <p className="text-sm text-red-700">You do not have access to this case.</p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      user={user}
      title={complaint ? complaint.title : "Case detail"}
    >
      {(message || error) && (
        <Card className="mb-6">
          <CardContent>
            {message && <p className="text-sm text-emerald-700">{message}</p>}
            {error && <p className="text-sm text-red-700">{error}</p>}
          </CardContent>
        </Card>
      )}

      {pageLoading || !complaint ? (
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Loading case information...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Case summary</CardTitle>
                <CardDescription>{complaint.trackingId}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Badge variant={getStatusVariant(complaint.status)}>{complaint.status}</Badge>
                  <Badge variant="secondary">{complaint.category}</Badge>
                  <Badge variant="secondary">{complaint.severity}</Badge>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Department</p>
                    <p className="mt-1 text-sm text-slate-700">{complaint.department}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Location</p>
                    <p className="mt-1 text-sm text-slate-700">{complaint.location}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Reporter</p>
                    <p className="mt-1 text-sm text-slate-700">{complaint.createdBy?.name || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Assigned to</p>
                    <p className="mt-1 text-sm text-slate-700">{complaint.assignedTo?.name || "Not assigned"}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Description</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{complaint.description}</p>
                </div>

                {complaint.attachmentUrl && (
                  <div className="mt-5">
                    <a
                      href={`${API_URL}${complaint.attachmentUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-brand-700"
                    >
                      Open attachment: {complaint.attachmentName}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Case notes</CardTitle>
              </CardHeader>
              <CardContent>
                {complaint.notes.length === 0 ? (
                  <p className="text-sm text-slate-500">No notes added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {complaint.notes.map((item, index) => (
                      <div key={`${item.createdAt}-${index}`} className="rounded-2xl border border-slate-100 p-4">
                        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                          <p className="font-medium text-slate-800">
                            {item.addedByName} ({item.addedByRole})
                          </p>
                          <p className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
                        </div>
                        <p className="mt-3 text-sm text-slate-600">{item.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {user.role === "Secretariat" && (
              <Card>
                <CardHeader>
                  <CardTitle>Assign case manager</CardTitle>
                  {complaint.assignedTo && (
                    <CardDescription className="text-amber-600">
                      ⚠️ This case is already assigned and cannot be reassigned.
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {complaint.assignedTo ? (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">
                        <strong>Assigned to:</strong> {complaint.assignedTo.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Assignment cannot be changed once a case manager is assigned.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleAssign} className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Case manager</label>
                        <Select
                          value={selectedManager}
                          onChange={(event) => setSelectedManager(event.target.value)}
                        >
                          <option value="">Select case manager</option>
                          {caseManagers.map((manager) => (
                            <option key={manager._id} value={manager._id}>
                              {manager.name}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <Button type="submit">Save assignment</Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}

            {user.role === "Case Manager" && (
              <Card>
                <CardHeader>
                  <CardTitle>Case Action</CardTitle>
                  <CardDescription>
                    <div className="space-y-2">
                      <div>
                        <strong>Current Status:</strong> {complaint.status}
                      </div>
                      <div className="text-sm text-slate-600">
                        {getStatusDescription(complaint.status)}
                      </div>
                      {complaint.status === "Resolved" && (
                        <div className="text-green-600 text-sm font-medium">
                          ✓ This case is resolved and cannot be updated further.
                        </div>
                      )}
                      {complaint.status === "Escalated" && (
                        <div className="text-amber-600 text-sm font-medium">
                          ⚠️ This case has been escalated to management.
                        </div>
                      )}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {complaint.status === "Resolved" ? (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">
                        This case has been resolved and no further actions are available.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleCaseUpdate} className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Update Status</label>
                        <Select value={status} onChange={(event) => setStatus(event.target.value)}>
                          <option value={complaint.status}>{complaint.status} (Current)</option>
                          {getValidNextStatuses(complaint.status).map((nextStatus) => (
                            <option key={nextStatus} value={nextStatus}>
                              {nextStatus} - {getStatusDescription(nextStatus)}
                            </option>
                          ))}
                        </Select>
                        {getValidNextStatuses(complaint.status).length === 0 ? (
                          <p className="text-xs text-slate-500 mt-1">
                            No status changes available for {complaint.status} cases.
                          </p>
                        ) : (
                          <p className="text-xs text-slate-500 mt-1">
                            Select the appropriate next status based on case progress.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Add Case Note</label>
                        <Textarea
                          value={note}
                          onChange={(event) => setNote(event.target.value)}
                          placeholder="Document your actions, findings, or next steps..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Public Update 
                          <span className="text-xs text-slate-500 font-normal">(Optional - visible to staff member)</span>
                        </label>
                        <Textarea
                          value={publicUpdate}
                          onChange={(event) => setPublicUpdate(event.target.value)}
                          placeholder="Summary of resolution or update for the staff member..."
                          rows={2}
                        />
                      </div>

                      <Button type="submit" className="w-full">Update Case</Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Case Lifecycle Reference</CardTitle>
                <CardDescription>Understanding case status progression</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-[80px_1fr] gap-3">
                    <Badge variant="outline" className="justify-center">New</Badge>
                    <span className="text-slate-600">Submission just came in, not yet reviewed</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-3">
                    <Badge variant="outline" className="justify-center">Assigned</Badge>
                    <span className="text-slate-600">Secretariat has assigned it to a Case Manager</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-3">
                    <Badge variant="outline" className="justify-center">In Progress</Badge>
                    <span className="text-slate-600">Case Manager is actively working on it</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-3">
                    <Badge variant="outline" className="justify-center">Pending</Badge>
                    <span className="text-slate-600">Waiting on more information from the staff member</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-3">
                    <Badge variant="outline" className="justify-center">Resolved</Badge>
                    <span className="text-slate-600">Case has been addressed and closed</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-3">
                    <Badge variant="destructive" className="justify-center">Escalated</Badge>
                    <span className="text-slate-600">7-day rule triggered — no response from Case Manager, Management has been alerted</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Case dates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-slate-600">
                  <p>Created: {formatDate(complaint.createdAt)}</p>
                  <p>Assigned: {formatDate(complaint.assignedAt)}</p>
                  <p>Last case manager action: {formatDate(complaint.lastCaseManagerActionAt)}</p>
                  <p>Reminder sent: {formatDate(complaint.reminderSentAt)}</p>
                  <p>Escalated: {formatDate(complaint.escalatedAt)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}