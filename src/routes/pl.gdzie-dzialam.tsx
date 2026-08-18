import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/locations";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/pl/gdzie-dzialam")(localeRoute("pl", page));
