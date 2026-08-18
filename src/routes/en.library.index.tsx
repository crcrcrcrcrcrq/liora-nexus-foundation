import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/library";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/en/library/")(localeRoute("en", page));
