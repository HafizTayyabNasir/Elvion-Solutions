"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isCustomer = pathname?.startsWith("/customer");
  const isDashboard = isAdmin || isCustomer;

  return (
    <>
      {!isDashboard && <Navbar />}
      <main className={isDashboard ? "" : "min-h-screen pt-20"}>
        {children}
      </main>
      {!isDashboard && <Footer />}
    </>
  );
}
