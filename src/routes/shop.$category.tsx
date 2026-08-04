import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/shop/$category")({
  component: () => <Outlet />,
});
