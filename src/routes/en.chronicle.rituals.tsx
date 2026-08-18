import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/chronicle-rituals";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/en/chronicle/rituals")(localeRoute("en", page));
