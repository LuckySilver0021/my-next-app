"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SignedIn, SignedOut, useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@heroui/button";
import {
  CloudUpload,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  User,
  UserCircle,
} from "lucide-react";

export default function Navbar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll blur effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 w-full z-50 transition-all ${
        isScrolled
          ? "backdrop-blur-md bg-white/70 dark:bg-black/40 shadow-sm"
          : "bg-transparent"
      }`}
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-6 md:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <CloudUpload className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Droply
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5">
          <SignedOut>
            <Link href="/signin">
              <Button variant="flat" color="primary">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="solid" color="primary">
                Sign Up
              </Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-4">
              {!pathname.startsWith("/dashboard") && (
                <Link href="/dashboard">
                  <Button
                    variant="flat"
                    color="primary"
                    startContent={<LayoutDashboard className="h-4 w-4" />}
                  >
                    Dashboard
                  </Button>
                </Link>
              )}

              {/* Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1 rounded-full border border-transparent hover:border-default-200 dark:hover:border-default-700 transition"
                >
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt="User Avatar"
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-default-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-default-600" />
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-52 bg-white dark:bg-neutral-900 border border-default-200 dark:border-default-700 rounded-xl shadow-lg overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-default-200 dark:border-default-700">
                        <p className="font-medium text-sm text-default-900 dark:text-default-100">
                          {user?.fullName || user?.username || "User"}
                        </p>
                        <p className="text-xs text-default-500 truncate">
                          {user?.primaryEmailAddress?.emailAddress || ""}
                        </p>
                      </div>
                      <div className="flex flex-col py-2">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            router.push("/dashboard?tab=profile");
                          }}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-default-100 dark:hover:bg-default-800 transition text-sm"
                        >
                          <UserCircle className="h-4 w-4" />
                          Profile
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-danger-50 dark:hover:bg-danger-900 text-danger-600 transition text-sm"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </SignedIn>
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-md hover:bg-default-100 dark:hover:bg-default-800 transition"
          >
            {menuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white dark:bg-neutral-950 border-t border-default-200 dark:border-default-800 shadow-lg px-6 py-4 space-y-3"
          >
            <SignedOut>
              <Link href="/signin" onClick={() => setMenuOpen(false)}>
                <Button variant="flat" color="primary" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)}>
                <Button variant="solid" color="primary" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-default-700 dark:text-default-200"
              >
                <LayoutDashboard className="h-5 w-5" /> Dashboard
              </Link>
              <Link
                href="/dashboard?tab=profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-default-700 dark:text-default-200"
              >
                <User className="h-5 w-5" /> Profile
              </Link>
              <button
                onClick={() => {
                  handleSignOut();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 py-2 text-danger-600"
              >
                <LogOut className="h-5 w-5" /> Sign Out
              </button>
            </SignedIn>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

