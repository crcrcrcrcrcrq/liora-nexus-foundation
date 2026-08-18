import { createFileRoute } from "@tanstack/react-router";
import { page } from "@/pages/chronicle-consultations";
import { localeRoute } from "@/lib/locale-route";

export const Route = createFileRoute("/pl/kronika/konsultacje")(localeRoute("pl", page));
