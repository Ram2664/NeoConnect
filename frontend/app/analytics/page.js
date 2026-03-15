"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import SimpleBarChart from "@/components/layout/SimpleBarChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";
import { useProtectedPage } from "@/lib/useProtectedPage";

const allowedRoles = ["Secretariat", "Admin"];

export default function AnalyticsPage() {
  const { user, loading, allowed } = useProtectedPage(allowedRoles);
  const [analytics, setAnalytics] = useState({
    openDepartments: [],
    departments: [],
    categories: [],
    statuses: [],
    hotSpots: []
  });
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!allowed) {
      return;
    }

    loadAnalytics();
  }, [allowed]);

  async function loadAnalytics() {
    setPageLoading(true);
    setError("");

    try {
      const data = await apiRequest("/analytics");
      setAnalytics(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPageLoading(false);
    }
  }

  if (loading) {
    return (
      <AppShell title="Analytics" description="Loading analytics...">
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
      <AppShell title="Analytics" description="Only secretariat and admin users can view analytics.">
        <Card>
          <CardContent>
            <p className="text-sm text-red-700">You do not have access to analytics.</p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      user={user}
      title="Analytics Dashboard"
    >
      {error && (
        <Card className="mb-6">
          <CardContent>
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {pageLoading ? (
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Loading analytics data...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <SimpleBarChart
              title="Open cases by department"
              description="A bar chart showing which departments have the most open cases."
              data={analytics.openDepartments}
              colorClass="bg-brand-700"
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Case counts</CardTitle>
                <CardDescription>Broken down by status, category, and department.</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.statuses.length === 0 ? (
                  <p className="text-sm text-slate-500">No data yet.</p>
                ) : (
                  <div className="grid gap-6 md:grid-cols-3">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b pb-2">By Status</h4>
                      <ul className="space-y-2">
                        {analytics.statuses.map((item) => (
                          <li key={item.label} className="flex justify-between text-sm text-slate-600">
                            <span>{item.label}</span>
                            <span className="font-medium text-slate-900">{item.count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b pb-2">By Category</h4>
                      <ul className="space-y-2">
                        {analytics.categories.map((item) => (
                          <li key={item.label} className="flex justify-between text-sm text-slate-600">
                            <span>{item.label}</span>
                            <span className="font-medium text-slate-900">{item.count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b pb-2">By Dept</h4>
                      <ul className="space-y-2">
                        {analytics.departments.map((item) => (
                          <li key={item.label} className="flex justify-between text-sm text-slate-600">
                            <span className="truncate pr-2">{item.label}</span>
                            <span className="font-medium text-slate-900">{item.count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hot spot alerts</CardTitle>
              <CardDescription>
                Any department and category combination with 5 or more complaints is highlighted here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.hotSpots.length === 0 ? (
                <p className="text-sm text-slate-500">No hot spots reached the alert limit yet.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {analytics.hotSpots.map((item) => (
                    <div key={`${item.department}-${item.category}`} className="rounded-2xl border border-red-100 bg-red-50 p-4">
                      <p className="font-medium text-red-900">
                        {item.department} • {item.category}
                      </p>
                      <p className="mt-2 text-sm text-red-700">{item.count} complaints reported.</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
