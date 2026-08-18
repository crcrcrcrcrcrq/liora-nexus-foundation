import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/about";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/pl/o-mnie")(localeRoute("pl", page));
