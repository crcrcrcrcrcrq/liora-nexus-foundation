import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/sanctuary";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/en/sanctuary")(localeRoute("en", page));
