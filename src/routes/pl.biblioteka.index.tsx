import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/library";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/pl/biblioteka/")(localeRoute("pl", page));
