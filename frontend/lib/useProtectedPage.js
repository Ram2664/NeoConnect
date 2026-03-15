"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthData, getAuthData } from "@/lib/auth";

export function useProtectedPage(requiredRoles = []) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const rolesKey = requiredRoles.join("|");

  useEffect(() => {
    const authData = getAuthData();

    if (!authData?.token || !authData?.user) {
      clearAuthData();
      router.replace("/login");
      return;
    }

    setUser(authData.user);

    if (requiredRoles.length === 0 || requiredRoles.includes(authData.user.role)) {
      setAllowed(true);
    } else {
      setAllowed(false);
    }

    setLoading(false);
  }, [router, rolesKey]);

  return {
    user,
    loading,
    allowed
  };
}
