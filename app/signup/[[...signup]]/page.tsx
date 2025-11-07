"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = wrapperRef.current;
    if (!root) return;

    const isNameText = (s: string) => {
      const t = s.trim().toLowerCase();
      // match 'first name', 'last name' or short variants like 'first'/'last' followed by 'name'
      return /^(first name|last name)$/.test(t) || /\b(first|last)\b/.test(t) && /name/.test(t);
    };

    const hideFieldContainer = (el: Element | null) => {
      if (!el) return;
      try {
        // prefer hiding the nearest semantic container (label, field wrapper, or the element itself)
        const label = el.tagName.toLowerCase() === "label" ? el : root.querySelector(`label[for="${(el as HTMLElement).id}"]`);
        if (label) {
          (label as HTMLElement).style.display = "none";
        }

        // hide associated input if possible
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
          (el as HTMLElement).style.display = "none";
        } else {
          // try to find an input nearby (within same parent)
          const parent = el.parentElement;
          if (parent) {
            const input = parent.querySelector('input, textarea, select');
            if (input) (input as HTMLElement).style.display = "none";
          }
        }

        // also hide a reasonable ancestor container to avoid leftover spacing
        const container = (el as HTMLElement).closest('div, section, fieldset, form');
        if (container && container !== root) {
          // only hide small containers (to avoid hiding the whole form)
          if ((container.textContent || "").length < 400) {
            (container as HTMLElement).style.display = "none";
          }
        }
      } catch (e) {
        // ignore errors
      }
    };

    const process = () => {
      // 1) hide inputs by attribute (name, id, placeholder, aria-label)
      const attrSelectors = [
        '[name="first_name"]',
        '[name="last_name"]',
        '[name="firstName"]',
        '[name="lastName"]',
        '[placeholder*="First name"]',
        '[placeholder*="Last name"]',
        '[aria-label*="First name"]',
        '[aria-label*="Last name"]'
      ];
      attrSelectors.forEach((sel) => {
        const found = Array.from(root.querySelectorAll(sel));
        found.forEach((f) => hideFieldContainer(f));
      });

      // 2) hide label text nodes that contain the target strings and their nearby inputs
      const textCandidates = Array.from(root.querySelectorAll('label,div,span,p'));
      textCandidates.forEach((el) => {
        const text = el.textContent || "";
        if (!text) return;
        const shortened = text.trim().replace(/\s+/g, ' ');
        if (shortened.length > 40) return; // avoid large blobs
        const t = shortened.toLowerCase();
        if (t.includes('first name') || t.includes('last name') || (/\bfirst\b/.test(t) && t.includes('name')) || (/\blast\b/.test(t) && t.includes('name'))) {
          hideFieldContainer(el);
        }
      });
    };

    // initial
    process();

    // observe async changes
    const mo = new MutationObserver(() => process());
    mo.observe(root, { childList: true, subtree: true, characterData: true });

    return () => mo.disconnect();
  }, []);

  return (
    <div className="w-full flex justify-center py-12">
      <div ref={wrapperRef} className="w-full max-w-md clerk-signup-wrapper">
        <SignUp
          path="/signup"
          routing="path"
          signInUrl="/signin"
          afterSignUpUrl="/dashboard"
          afterSignInUrl="/dashboard"
          redirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: mounted ? undefined : { display: 'none' }
            }
          }}
        />
      </div>
    </div>
  );
}
