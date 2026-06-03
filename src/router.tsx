import { QueryClient, dehydrate, hydrate, type DehydratedState } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Serialize the QueryClient cache from server so the client
    // re-hydrates with the same data and useSuspenseQuery never
    // suspends during hydration (preventing the Suspense vs div mismatch).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dehydrate: (): any => ({
      // Queries only — mutations are not needed for SSR state transfer.
      // The `any` return type bypasses DehydratedState’s mutationKey: unknown[]
      // which cannot satisfy TanStack Router’s Serializable constraint.
      queryClientState: dehydrate(queryClient, {
        shouldDehydrateMutation: () => false,
      }),
    }),
    hydrate: ({ queryClientState }: { queryClientState: DehydratedState }) => {
      hydrate(queryClient, queryClientState);
    },
  });

  return router;
};
