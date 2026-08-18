import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/chronicle";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/pl/kronika")(localeRoute("pl", page));
