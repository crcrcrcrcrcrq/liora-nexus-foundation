import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/astrology";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/en/astrology")(localeRoute("en", page));
