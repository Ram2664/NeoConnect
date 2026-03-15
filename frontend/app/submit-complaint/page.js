"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import { useProtectedPage } from "@/lib/useProtectedPage";

const categories = ["Safety", "Policy", "Facilities", "HR", "Other"];
const severities = ["Low", "Medium", "High"];

export default function SubmitComplaintPage() {
  const { user, loading, allowed } = useProtectedPage(["Staff"]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Safety",
    department: "",
    location: "",
    severity: "Low",
    anonymous: false
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData((currentValue) => ({
      ...currentValue,
      department: currentValue.department || user.department
    }));
  }, [user]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("category", formData.category);
      submitData.append("department", formData.department);
      submitData.append("location", formData.location);
      submitData.append("severity", formData.severity);
      submitData.append("anonymous", formData.anonymous);

      if (selectedFile) {
        submitData.append("file", selectedFile);
      }

      const complaint = await apiRequest("/complaints", {
        method: "POST",
        body: submitData
      });

      setMessage(`Complaint submitted successfully. Tracking ID: ${complaint.trackingId}`);
      setSelectedFile(null);
      setFormData({
        title: "",
        description: "",
        category: "Safety",
        department: user.department,
        location: "",
        severity: "Low",
        anonymous: false
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppShell title="Submit complaint" description="Loading your session...">
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
      <AppShell title="Submit complaint" description="This page is available only for staff users.">
        <Card>
          <CardContent>
            <p className="text-sm text-red-700">You do not have access to create complaints.</p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      user={user}
      title="Complaint Submission Form"
    >
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>New complaint</CardTitle>
            <CardDescription>
              Fill the form below. A tracking ID will be generated automatically after submission.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Short title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      title: event.target.value
                    })
                  }
                  placeholder="Complaint title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      description: event.target.value
                    })
                  }
                  placeholder="Description"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    id="category"
                    value={formData.category}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        category: event.target.value
                      })
                    }
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    id="severity"
                    value={formData.severity}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        severity: event.target.value
                      })
                    }
                  >
                    {severities.map((severity) => (
                      <option key={severity} value={severity}>
                        {severity}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        department: event.target.value
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        location: event.target.value
                      })
                    }
                    placeholder="Location"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="file">Upload photo or PDF</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">Submit anonymously</p>
                  <p className="text-xs text-slate-500">
                    Your case is still saved, but the reporter name is hidden.
                  </p>
                </div>
                <Switch
                  checked={formData.anonymous}
                  onCheckedChange={(value) =>
                    setFormData({
                      ...formData,
                      anonymous: value
                    })
                  }
                />
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? "Submitting..." : "Submit complaint"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">

          {(message || error) && (
            <Card>
              <CardContent>
                {message && <p className="text-sm text-emerald-700">{message}</p>}
                {error && <p className="text-sm text-red-700">{error}</p>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
