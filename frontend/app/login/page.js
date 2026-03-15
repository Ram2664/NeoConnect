"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { apiRequest } from "@/lib/api";
import { getAuthData, saveAuthData } from "@/lib/auth";
import { getDashboardPath } from "@/lib/dashboard";

const roleOptions = ["Staff", "Secretariat", "Case Manager", "Admin"];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    role: "Staff"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const authData = getAuthData();

    if (authData?.token && authData?.user) {
      router.replace(getDashboardPath(authData.user.role));
    }
  }, [router]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await apiRequest("/login", {
        method: "POST",
        body: JSON.stringify(loginForm)
      });

      saveAuthData(data);
      setMessage("Login successful. Opening dashboard...");
      router.replace(getDashboardPath(data.user.role));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await apiRequest("/register", {
        method: "POST",
        body: JSON.stringify(registerForm)
      });

      if (data.token) {
        // Auto-approved (e.g., Admin)
        saveAuthData(data);
        setMessage("Account created. Opening dashboard...");
        router.replace(getDashboardPath(data.user.role));
      } else {
        // Pending approval
        setMessage(data.message);
        setMode("login");
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">NeoConnect</h1>
          <p className="mt-2 text-sm text-slate-500">
            Staff complaint management system
          </p>
        </div>

        <Card className="rounded-2xl border border-slate-200 bg-white p-0 shadow-sm">
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
                onClick={() => {
                  setMode("login");
                  setMessage("");
                  setError("");
                }}
              >
                Login
              </button>
              <button
                type="button"
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  mode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
                onClick={() => {
                  setMode("signup");
                  setMessage("");
                  setError("");
                }}
              >
                Signup
              </button>
            </div>

            {mode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="mail@gmail.com"
                    value={loginForm.email}
                    onChange={(event) =>
                      setLoginForm({
                        ...loginForm,
                        email: event.target.value
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="password"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm({
                        ...loginForm,
                        password: event.target.value
                      })
                    }
                    required
                  />
                </div>

                <Button type="submit" size="full" disabled={loading}>
                  {loading ? "Please wait..." : "Login"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="register-name">Full name</Label>
                  <Input
                    id="register-name"
                    placeholder="name"
                    value={registerForm.name}
                    onChange={(event) =>
                      setRegisterForm({
                        ...registerForm,
                        name: event.target.value
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="mail@gmail.com"
                    value={registerForm.email}
                    onChange={(event) =>
                      setRegisterForm({
                        ...registerForm,
                        email: event.target.value
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="password"
                    value={registerForm.password}
                    onChange={(event) =>
                      setRegisterForm({
                        ...registerForm,
                        password: event.target.value
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="register-department">Department</Label>
                  <Input
                    id="register-department"
                    placeholder="department"
                    value={registerForm.department}
                    onChange={(event) =>
                      setRegisterForm({
                        ...registerForm,
                        department: event.target.value
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="register-role">Role</Label>
                  <Select
                    id="register-role"
                    value={registerForm.role}
                    onChange={(event) =>
                      setRegisterForm({
                        ...registerForm,
                        role: event.target.value
                      })
                    }
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </Select>
                </div>

                <Button type="submit" size="full" disabled={loading}>
                  {loading ? "Please wait..." : "Create account"}
                </Button>
              </form>
            )}

            {(message || error) && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                {message && <p className="text-sm text-emerald-700">{message}</p>}
                {error && <p className="text-sm text-red-700">{error}</p>}
              </div>
            )}

            <div className="text-center text-sm text-slate-500">
              <Link href="/public-hub" className="font-medium text-brand-700">
                Open Public Hub
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
