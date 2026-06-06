import {
  Bell,
  Building2,
  Camera,
  Lock,
  Mail,
  Moon,
  Palette,
  Shield,
  Smartphone,
  Sun,
  User as UserIcon,
  Volume2,
  Wifi,
} from "lucide-react";
import { Page, PageHeader, PageSection } from "@/components/layout/Page";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Avatar } from "@/components/ui/Avatar";
import { Select } from "@/components/ui/Select";
import { Separator } from "@/components/ui/Separator";
import { useUIStore, useAuthStore } from "@/store";
import { cn } from "@/lib/utils";

export function SettingsPage() {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const accent = useUIStore((s) => s.accent);
  const setAccent = useUIStore((s) => s.setAccent);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <Page>
      <PageHeader
        eyebrow="//SETTINGS"
        title="Settings"
        description="Account, theme, and how you show up on the floor."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader title="PROFILE" />
            <CardBody className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar src={user?.avatar} name={user?.name ?? "?"} size="xl" status="online" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-fg">{user?.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
                    @{user?.username} · {user?.hostel.name}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" block leftIcon={<Camera className="h-3 w-3" />}>
                CHANGE_PHOTO
              </Button>
            </CardBody>
          </Card>
        </aside>

        <div className="space-y-4">
          <Card>
            <CardHeader title="ACCOUNT" />
            <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="DISPLAY_NAME" defaultValue={user?.name} leftAddon={<UserIcon className="h-3.5 w-3.5" />} />
              <Input label="USERNAME" defaultValue={user?.username} leftAddon={<span className="font-mono text-xs">@</span>} monospace />
              <Input label="EMAIL" type="email" defaultValue={user?.email} leftAddon={<Mail className="h-3.5 w-3.5" />} />
              <Input label="PHONE" placeholder="+91" leftAddon={<Smartphone className="h-3.5 w-3.5" />} />
              <Select
                label="HOSTEL"
                options={[
                  { value: "BH-1", label: "BH-1 · Boys 1" },
                  { value: "BH-2", label: "BH-2 · Boys 2" },
                  { value: "GH-1", label: "GH-1 · Girls 1" },
                  { value: "GH-2", label: "GH-2 · Girls 2" },
                ]}
                value={user?.hostel.name}
                onChange={() => {}}
                leftAddon={<Building2 className="h-3.5 w-3.5" />}
              />
              <Input label="ROOM" defaultValue={user?.room} monospace />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="APPEARANCE" />
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg">THEME</div>
                  <div className="text-xs text-fg-muted">Dark by default, light mirror of the system.</div>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex h-8 items-center gap-2 border border-line bg-ink-200 px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-fg hover:border-fg-subtle"
                >
                  {theme === "dark" ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
                  {theme === "dark" ? "DARK" : "LIGHT"}
                </button>
              </div>
              <Separator variant="dot" />
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg">ACCENT</div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
                    {accent.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(["red", "cyan", "amber", "violet"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAccent(c)}
                      className={cn(
                        "h-12 border-2 transition-all",
                        c === "red" && "bg-signal",
                        c === "cyan" && "bg-cyan",
                        c === "amber" && "bg-warning",
                        c === "violet" && "bg-violet-500",
                        accent === c ? "border-fg" : "border-line opacity-60 hover:opacity-100",
                      )}
                      aria-label={c}
                    />
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="NOTIFICATIONS" />
            <CardBody className="space-y-3">
              <Toggle label="MESSAGES" description="New chat and offers" defaultChecked />
              <Toggle label="SAVED_ITEMS" description="Price drops, status changes" defaultChecked />
              <Toggle label="FLOOR_UPDATES" description="New listings on your floor" defaultChecked />
              <Toggle label="DIGEST_EMAIL" description="Weekly Sunday roundup" defaultChecked />
              <Toggle label="PUSH_NOTIFICATIONS" description="Browser push on urgent" />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="SECURITY" />
            <CardBody className="space-y-3">
              <Button variant="outline" size="sm" leftIcon={<Lock className="h-3 w-3" />}>
                CHANGE_PASSWORD
              </Button>
              <Button variant="outline" size="sm" leftIcon={<Shield className="h-3 w-3" />}>
                TWO_FACTOR_AUTH
              </Button>
              <Button variant="outline" size="sm" leftIcon={<Volume2 className="h-3 w-3" />}>
                ACTIVE_SESSIONS
              </Button>
              <Separator variant="dot" />
              <Button variant="danger" size="sm" onClick={signOut}>
                SIGN_OUT
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </Page>
  );
}
