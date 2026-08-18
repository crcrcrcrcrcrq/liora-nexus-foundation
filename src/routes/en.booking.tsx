import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/booking";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/en/booking")(localeRoute("en", page));
