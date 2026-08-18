import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/privacy";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/en/privacy-policy")(localeRoute("en", page));
