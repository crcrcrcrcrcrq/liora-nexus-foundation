import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/article";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/en/library/$slug")(localeRoute("en", page));
