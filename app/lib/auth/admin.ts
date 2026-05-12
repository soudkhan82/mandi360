export function isAdminUser(email?: string | null, role?: string | null) {
  const normalizedEmail = (email || "").toLowerCase().trim();
  const normalizedRole = (role || "").toLowerCase().trim();

  return (
    normalizedRole === "admin" ||
    normalizedEmail === "soudkhan82@gmail.com"
  );
}