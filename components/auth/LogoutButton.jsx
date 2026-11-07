"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Button from "@/components/ui/Button";
import { logout } from "@/lib/api";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="secondary"
      icon={LogOut}
      loading={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await logout();
        } finally {
          router.replace("/login");
          router.refresh();
        }
      }}
    >
      Keluar
    </Button>
  );
}
