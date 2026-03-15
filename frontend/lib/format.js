export function formatDate(dateValue) {
  if (!dateValue) {
    return "Not available";
  }

  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export function formatDateTime(dateValue) {
  if (!dateValue) {
    return "Not available";
  }

  return new Date(dateValue).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export function getStatusVariant(status) {
  const variants = {
    New: "warning",
    Assigned: "secondary",
    "In Progress": "info",
    Pending: "warning",
    Resolved: "success",
    Escalated: "danger"
  };

  return variants[status] || "secondary";
}
