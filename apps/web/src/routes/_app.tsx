import { auth } from "@clerk/tanstack-react-start/server";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { AppLayout } from "../components/layout/AppLayout";

const requireAuthentication = createServerFn().handler(async () => {
  const { isAuthenticated } = await auth();

  if (!isAuthenticated) {
    throw redirect({ href: "/sign-in" });
  }
});

export const Route = createFileRoute("/_app")({
  beforeLoad: () => requireAuthentication(),
  component: AppLayout,
});
