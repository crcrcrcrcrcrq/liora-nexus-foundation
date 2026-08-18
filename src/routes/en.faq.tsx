import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/faq";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/en/faq")(localeRoute("en", page));
