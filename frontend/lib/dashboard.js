export function getDashboardPath(role) {
  return "/dashboard";
}

export function getDashboardTitle(role) {
  if (role === "Staff") return "Staff Dashboard";
  if (role === "Secretariat") return "Secretariat Dashboard";
  if (role === "Case Manager") return "Case Manager Dashboard";
  if (role === "Admin") return "Admin Dashboard";
  return "Dashboard";
}

export function getDashboardDescription(role) {
  return "";
}
