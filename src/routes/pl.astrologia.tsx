import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/astrology";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/pl/astrologia")(localeRoute("pl", page));
