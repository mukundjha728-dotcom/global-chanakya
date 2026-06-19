import { auth } from "@/auth";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const session = await auth();
  // Pass only serializable user data to client component
  const safeSession = session
    ? {
        user: {
          name: session.user?.name ?? null,
          email: session.user?.email ?? null,
          role: session.user.role ?? "free",
        },
      }
    : null;

  return <NavbarClient session={safeSession} />;
}
