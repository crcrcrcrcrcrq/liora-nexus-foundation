import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/services";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/pl/uslugi")(localeRoute("pl", page));
