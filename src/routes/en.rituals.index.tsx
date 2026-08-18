import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/rituals";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/en/rituals/")(localeRoute("en", page));
