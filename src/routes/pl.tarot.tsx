import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/tarot";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/pl/tarot")(localeRoute("pl", page));
