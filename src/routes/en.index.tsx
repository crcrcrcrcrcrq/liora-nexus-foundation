import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/home";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/en/")(localeRoute("en", page));
