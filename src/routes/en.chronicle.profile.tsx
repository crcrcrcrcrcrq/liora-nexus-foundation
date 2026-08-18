import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/chronicle-profile";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/en/chronicle/profile")(localeRoute("en", page));
