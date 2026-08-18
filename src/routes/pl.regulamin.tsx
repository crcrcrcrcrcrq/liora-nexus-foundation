import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/terms";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/pl/regulamin")(localeRoute("pl", page));
