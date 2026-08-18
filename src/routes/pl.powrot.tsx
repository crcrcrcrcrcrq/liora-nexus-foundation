import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/auth-return";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/pl/powrot")(localeRoute("pl", page));
