import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/contact";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/en/contact")(localeRoute("en", page));
