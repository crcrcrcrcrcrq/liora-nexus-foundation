import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/contact";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/pl/kontakt")(localeRoute("pl", page));
