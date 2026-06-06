import { type HTMLAttributes, type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/hooks";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  variant?: "underline" | "pills" | "segmented";
  size?: "sm" | "md";
}

export function Tabs({
  tabs,
  active,
  onChange,
  variant = "underline",
  size = "md",
  className,
  ...props
}: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "relative flex items-center",
        variant === "underline" && "border-b border-line",
        variant === "pills" && "gap-1",
        variant === "segmented" &&
          "border border-line bg-surface-raised p-0.5",
        className,
      )}
      {...props}
    >
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={isActive}
            disabled={t.disabled}
            onClick={() => onChange(t.id)}
            className={cn(
              "group/tab relative flex items-center gap-1.5 font-mono uppercase tracking-[0.16em] transition-colors",
              size === "sm" ? "h-7 text-[10px]" : "h-9 text-[11px]",
              variant === "underline" && [
                "px-3",
                isActive
                  ? "text-fg"
                  : "text-fg-subtle hover:text-fg-muted disabled:opacity-40",
              ],
              variant === "pills" && [
                "px-3 border border-transparent",
                isActive
                  ? "border-fg text-fg bg-surface-raised"
                  : "text-fg-subtle hover:text-fg hover:border-line",
              ],
              variant === "segmented" && [
                "flex-1 justify-center px-3",
                isActive
                  ? "bg-surface-raised text-fg"
                  : "text-fg-subtle hover:text-fg",
              ],
            )}
          >
            {t.icon}
            <span>{t.label}</span>
            {typeof t.count === "number" && (
              <span
                className={cn(
                  "border border-line bg-surface-raised px-1 text-[9px] tabular-nums",
                  isActive && "border-fg-subtle text-fg",
                )}
              >
                {t.count}
              </span>
            )}
            {variant === "underline" && isActive && (
              <span
                className="absolute -bottom-px left-0 right-0 h-px bg-signal"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export interface DropdownItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  onSelect?: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "start" | "end";
  className?: string;
}

export function Dropdown({ trigger, items, align = "end", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));

  return (
    <div className={cn("relative inline-block", className)} ref={ref}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute top-full z-30 mt-1 min-w-[200px] border border-line bg-surface py-1 text-mono text-fg shadow-panel-raised",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {items.map((item, i) => {
            if (item.divider) {
              return <div key={`d-${i}`} className="my-1 h-px bg-line" />;
            }
            return (
              <button
                key={item.id}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onSelect?.();
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] uppercase tracking-[0.14em] transition-colors",
                  item.disabled && "cursor-not-allowed opacity-40",
                  item.danger
                    ? "text-signal hover:bg-signal/10"
                    : "text-fg-muted hover:bg-surface-raised hover:text-fg",
                )}
              >
                {item.icon && <span className="grid h-3 w-3 place-items-center">{item.icon}</span>}
                <span className="flex-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
