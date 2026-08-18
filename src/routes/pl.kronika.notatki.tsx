import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/chronicle-notes";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/pl/kronika/notatki")(localeRoute("pl", page));
