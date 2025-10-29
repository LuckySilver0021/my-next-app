"use client"; // 👈 this line is critical

import type { ThemeProviderProps } from "next-themes";
import { ImageKitProvider } from "imagekitio-next";
import { HeroUIProvider } from "@heroui/react";
import React from "react";

export interface ProviderProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

const authenticator = async () => {
  try {
    const res = await fetch("/api/imagekit");
    const data = await res.json();
    return data;
  } catch (error) {
    console.log("Authentication error:", error);
    throw error;
  }
};

export function Providers({ children, themeProps }: ProviderProps) {
  return (
    <ImageKitProvider
      authenticator={authenticator}
      publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ""}
      urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""}
    >
      <HeroUIProvider
      >
        {children}
      </HeroUIProvider>
    </ImageKitProvider>
  );
}
