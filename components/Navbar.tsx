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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "backdrop-blur-xl bg-white/60 dark:bg-neutral-950/50 border-b border-neutral-200/30 dark:border-neutral-800/30 shadow-[0_2px_20px_rgba(0,0,0,0.03)]"
          : "bg-transparent"
      }`}
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between py-3 pl-2 pr-4 md:pl-4 md:pr-8">


        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-tr from-primary/80 to-blue-500/80 text-white shadow-sm group-hover:scale-105 transition-transform">
            <CloudUpload className="h-4.5 w-4.5" />
          </div>
          <span className="text-[1.35rem] font-semibold tracking-tight bg-gradient-to-r from-neutral-900 via-primary to-blue-600 dark:from-neutral-100 dark:via-blue-400 dark:to-blue-500 bg-clip-text text-transparent hover:opacity-90 transition-opacity">
            Droply
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-5">
          <SignedOut>
            <Link href="/signin">
              <Button
                variant="flat"
                color="primary"
                className="font-medium rounded-lg transition-all hover:scale-[1.03] shadow-sm"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="solid"
                color="primary"
                className="font-medium rounded-lg transition-all hover:scale-[1.03] shadow-sm"
              >
                Sign Up
              </Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-5">
              {!pathname.startsWith("/dashboard") && (
                <Link href="/dashboard">
                  <Button
                    variant="flat"
                    color="primary"
                    startContent={<LayoutDashboard className="h-4 w-4" />}
                    className="font-medium rounded-lg hover:scale-[1.03] transition-transform shadow-sm"
                  >
                    Dashboard
                  </Button>
                </Link>
              )}

              {/* Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-[2px] rounded-full ring-1 ring-transparent hover:ring-default-200 dark:hover:ring-default-700 transition-all duration-200"
                >
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt="User Avatar"
                      className="h-9 w-9 rounded-full object-cover ring-1 ring-default-200 dark:ring-default-700"
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
                      className="absolute right-0 mt-3 w-56 bg-white/90 dark:bg-neutral-900/90 border border-default-200/60 dark:border-default-700/60 rounded-2xl shadow-xl overflow-hidden backdrop-blur-lg"
                    >
                      <div className="px-4 py-3 border-b border-default-200/60 dark:border-default-700/60">
                        <p className="font-medium text-sm text-default-900 dark:text-default-100">
                          {user?.fullName || user?.username || "User"}
                        </p>
                        <p className="text-xs text-default-500 truncate">
                          {user?.primaryEmailAddress?.emailAddress || ""}
                        </p>
                      </div>
                      <div className="flex flex-col py-1">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            router.push("/dashboard?tab=profile");
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-default-100 dark:hover:bg-default-800/50 transition text-sm font-medium"
                        >
                          <UserCircle className="h-4 w-4" />
                          Profile
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-danger-50/70 dark:hover:bg-danger-900/40 text-danger-600 transition text-sm font-medium"
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

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-md hover:bg-default-100 dark:hover:bg-default-800 transition-all duration-200 active:scale-95"
          >
            {menuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white/90 dark:bg-neutral-950/90 backdrop-blur-lg border-t border-default-200 dark:border-default-800 shadow-lg px-6 py-4 space-y-3"
          >
            <SignedOut>
              <Link href="/signin" onClick={() => setMenuOpen(false)}>
                <Button
                  variant="flat"
                  color="primary"
                  className="w-full rounded-lg font-medium shadow-sm"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up" onClick={() => setMenuOpen(false)}>
                <Button
                  variant="solid"
                  color="primary"
                  className="w-full rounded-lg font-medium shadow-sm"
                >
                  Sign Up
                </Button>
              </Link>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-default-700 dark:text-default-200 hover:text-primary transition-colors"
              >
                <LayoutDashboard className="h-5 w-5" /> Dashboard
              </Link>
              <Link
                href="/dashboard?tab=profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-default-700 dark:text-default-200 hover:text-primary transition-colors"
              >
                <User className="h-5 w-5" /> Profile
              </Link>
              <button
                onClick={() => {
                  handleSignOut();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 py-2 text-danger-600 hover:text-danger-700 transition-colors"
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
