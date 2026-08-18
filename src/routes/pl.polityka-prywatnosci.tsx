import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/privacy";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/pl/polityka-prywatnosci")(localeRoute("pl", page));
