"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableCell, TableHead } from "@/components/ui/table";
import { API_URL, apiRequest, publicRequest } from "@/lib/api";
import { getAuthData } from "@/lib/auth";
import { formatDate } from "@/lib/format";


export default function PublicHubPage() {
  const [user, setUser] = useState(null);
  const [minutes, setMinutes] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [minuteForm, setMinuteForm] = useState({
    title: "",
    quarter: "",
    meetingDate: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const authData = getAuthData();
    setUser(authData?.user || null);
    loadMinutes();
  }, []);

  async function loadMinutes() {
    try {
      const data = await publicRequest("/minutes");
      setMinutes(data);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleUploadMinute(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", minuteForm.title);
      formData.append("quarter", minuteForm.quarter);
      formData.append("meetingDate", minuteForm.meetingDate);

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      await apiRequest("/minutes", {
        method: "POST",
        body: formData
      });

      setMessage("Meeting minutes uploaded.");
      setMinuteForm({
        title: "",
        quarter: "",
        meetingDate: ""
      });
      setSelectedFile(null);
      loadMinutes();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <AppShell
      user={user}
      title="Public Hub"
    >
      {(message || error) && (
        <Card className="mb-6">
          <CardContent>
            {message && <p className="text-sm text-emerald-700">{message}</p>}
            {error && <p className="text-sm text-red-700">{error}</p>}
          </CardContent>
        </Card>
      )}

      {(user?.role === "Secretariat") && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload meeting minutes</CardTitle>
            <CardDescription>Only PDF files are used here so the archive stays simple.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUploadMinute} className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="minute-title">Title</Label>
                <Input
                  id="minute-title"
                  value={minuteForm.title}
                  onChange={(event) =>
                    setMinuteForm({
                      ...minuteForm,
                      title: event.target.value
                    })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="minute-quarter">Quarter</Label>
                <Input
                  id="minute-quarter"
                  value={minuteForm.quarter}
                  onChange={(event) =>
                    setMinuteForm({
                      ...minuteForm,
                      quarter: event.target.value
                    })
                  }
                  placeholder="Quarter"
                  required
                />
              </div>

              <div>
                <Label htmlFor="minute-date">Meeting date</Label>
                <Input
                  id="minute-date"
                  type="date"
                  value={minuteForm.meetingDate}
                  onChange={(event) =>
                    setMinuteForm({
                      ...minuteForm,
                      meetingDate: event.target.value
                    })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="minute-file">PDF file</Label>
                <Input
                  id="minute-file"
                  type="file"
                  accept=".pdf"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Button type="submit">Upload minutes</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Quarterly digest</CardTitle>
            <CardDescription>Blog-style updates that are easy to read during demos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-slate-500">No quarterly digest posts available yet.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meeting minutes archive</CardTitle>
            <CardDescription>Uploaded PDF files appear here for quick access.</CardDescription>
          </CardHeader>
          <CardContent>
            {minutes.length === 0 ? (
              <p className="text-sm text-slate-500">No meeting minutes uploaded yet.</p>
            ) : (
              <div className="space-y-4">
                {minutes.map((item) => (
                  <div key={item._id} className="rounded-2xl border border-slate-100 p-4">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.quarter} • {formatDate(item.meetingDate)}
                    </p>
                    <a
                      href={`${API_URL}${item.pdfUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-sm font-medium text-brand-700"
                    >
                      Open PDF
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Impact tracking</CardTitle>
          <CardDescription>Issue to action to result in a simple table.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <TableHead>Issue</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Result</TableHead>
              </tr>
            </thead>
            <tbody>
              <tr>
                <TableCell colSpan={3} className="text-center text-slate-500">
                  No impact tracking data available yet.
                </TableCell>
              </tr>
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
