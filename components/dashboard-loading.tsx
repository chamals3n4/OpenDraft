export default function DashboardLoading() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[50vh]">
      <div className="size-8 animate-spin rounded-full border-[3px] border-muted-foreground/20 border-t-muted-foreground" />
    </div>
  );
}
