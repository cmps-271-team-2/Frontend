import { Suspense } from "react";
import AdminGate from "./ui/AdminGate";

export const metadata = {
  title: "FreedomBot 🦅",
};

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminGate />
    </Suspense>
  );
}
