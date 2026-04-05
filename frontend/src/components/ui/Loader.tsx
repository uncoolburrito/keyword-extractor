import { cn } from "@/lib/utils";

export function Loader({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-t-2 border-l-2 border-white/80 animate-spin" />
        <div className="absolute inset-2 rounded-full border-b-2 border-r-2 border-white/40 animate-spin delay-150" />
        <div className="absolute inset-4 rounded-full border-t-2 border-white/20 animate-spin delay-300" />
      </div>
      <p className="text-white/70 text-sm font-medium animate-pulse tracking-wide">
        Analyzing document structure...
      </p>
    </div>
  );
}
