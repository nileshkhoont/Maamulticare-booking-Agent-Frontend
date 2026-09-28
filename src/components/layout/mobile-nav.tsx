"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { NavLinks } from "@/components/layout/nav-links";
import { SidebarFooter } from "@/components/layout/sidebar-footer";

/** Slide-in nav drawer for below md, where the persistent Sidebar is hidden — without this,
 * there was previously NO way to navigate between pages on a phone or narrow tablet at all.
 */
export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="animate-overlay-in absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="animate-drawer-in absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-card shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        <div className="flex h-20 items-center justify-between gap-2 border-b border-border px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-white shadow-sm">
              <Image src="/assets/logo-mark.png" alt="" width={56} height={56} className="h-full w-full object-cover" />
            </div>
            <p className="truncate text-sm font-semibold tracking-tight">{siteConfig.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <NavLinks onNavigate={onClose} />
        </div>
        <SidebarFooter />
      </aside>
    </div>
  );
}
