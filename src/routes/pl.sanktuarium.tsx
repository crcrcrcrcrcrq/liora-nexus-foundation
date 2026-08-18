import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/sanctuary";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/pl/sanktuarium")(localeRoute("pl", page));
