import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/chronicle";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/en/chronicle")(localeRoute("en", page));
