import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-xl bg-black/[.07]", className)} aria-hidden />;
}

export function CardSkeleton() {
  return (
    <div className="card p-4 flex flex-col gap-3">
      <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
