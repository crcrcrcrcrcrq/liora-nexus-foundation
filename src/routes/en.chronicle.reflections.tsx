import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/chronicle-reflections";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/en/chronicle/reflections")(localeRoute("en", page));
