import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/article";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/pl/biblioteka/$slug")(localeRoute("pl", page));
