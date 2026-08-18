import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/ritual";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/en/rituals/$slug")(localeRoute("en", page));
