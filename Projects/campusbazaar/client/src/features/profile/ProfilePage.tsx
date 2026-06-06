import { Link, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Edit3,
  MapPin,
  MessageCircle,
  Package,
  Shield,
  Star,
  Calendar,
  Activity,
  Award,
  TrendingUp,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useUserListings } from "@/features/listings/useListings";
import { ListingCard } from "@/features/listings/ListingCard";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import { Sparkline } from "@/components/ui/Sparkline";
import { MetaCell, LEDCounter } from "@/components/ui/Atoms";
import { Page, PageHeader, Stack, Inline, PageSection } from "@/components/layout/Page";
import { localStore } from "@/data";
import { formatPrice, timeAgo } from "@/lib/utils";

export function ProfilePage() {
  const { username = "aarav_x" } = useParams<{ username: string }>();
  const user = localStore.getUser(username) ?? localStore.getUser("u1")!;
  const { data: userListings } = useUserListings(user.id);

  const sparkData = Array.from({ length: 14 }, (_, i) => 8 + Math.sin(i / 1.6) * 4 + i);
  const sparkSold = Array.from({ length: 14 }, (_, i) => 2 + Math.cos(i / 2) * 1.5 + i / 3);

  return (
    <Page>
      <ProfileHeader user={user} />

      <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-4">
        <Stat label="LISTINGS" value={user.listingsCount} accent="signal" />
        <Stat label="SOLD" value={user.soldCount} accent="success" />
        <Stat label="RATING" value={user.rating.toFixed(1)} accent="warning" />
        <Stat label="REVIEWS" value={user.ratingsCount} accent="cyan" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <PageSection
            title="ACTIVE_LISTINGS"
            meta={
              <Badge variant="default" size="sm" dot>
                <span className="tabular-nums">{userListings?.filter((l) => l.status === "active").length ?? 0}</span>{" "}
                ACTIVE
              </Badge>
            }
            action={
              <Link to="/sell">
                <Button variant="primary" size="sm" leftIcon={<Edit3 className="h-3 w-3" />}>
                  NEW_POST
                </Button>
              </Link>
            }
          >
            {userListings && userListings.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {userListings
                  .filter((l) => l.status === "active")
                  .map((l) => (
                    <ListingCard key={l.id} listing={l} />
                  ))}
              </div>
            ) : (
              <div className="border border-dashed border-line bg-surface/40 p-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
                NO_ACTIVE_LISTINGS
              </div>
            )}
          </PageSection>

          <PageSection title="SOLD_HISTORY" meta={<Badge variant="success" size="sm" dot pulse>VERIFIED</Badge>}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {userListings
                ?.filter((l) => l.status === "sold")
                .slice(0, 6)
                .map((l) => (
                  <Link
                    key={l.id}
                    to={`/listing/${l.id}`}
                    className="flex items-center gap-3 border border-line bg-surface p-3 transition-colors hover:border-fg-subtle"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center border border-line bg-ink-200">
                      <Package className="h-3.5 w-3.5 text-fg-subtle" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-fg">{l.title}</div>
                      <div className="font-mono text-[10px] tabular-nums text-fg-subtle">
                        {formatPrice(l.price)} · {timeAgo(l.createdAt)}
                      </div>
                    </div>
                    <Badge variant="success" size="xs">SOLD</Badge>
                  </Link>
                ))}
              {userListings?.filter((l) => l.status === "sold").length === 0 && (
                <div className="col-span-full border border-dashed border-line bg-surface/40 p-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
                  NO_SOLD_HISTORY_YET
                </div>
              )}
            </div>
          </PageSection>
        </div>

        <aside className="space-y-3">
          <Card>
            <CardHeader title="ANALYTICS" meta="14_D" />
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-fg-subtle">
                    PROFILE_VIEWS
                  </div>
                  <div className="font-mono text-lg tabular-nums text-fg">312</div>
                </div>
                <Sparkline values={sparkData} width={80} height={28} stroke="var(--color-signal)" />
              </div>
              <Separator variant="dot" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-fg-subtle">
                    SOLD_RATE
                  </div>
                  <div className="font-mono text-lg tabular-nums text-fg">68%</div>
                </div>
                <Sparkline values={sparkSold} width={80} height={28} stroke="var(--color-success)" />
              </div>
              <Separator variant="dot" />
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-fg-subtle">
                  RANK
                </span>
                <LEDCounter value="0042" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="VERIFICATION" meta="LEVEL_3" />
            <CardBody className="space-y-2">
              <VerifyRow ok label=".EDU_EMAIL" detail="verified@hostel.edu" />
              <VerifyRow ok label="FLOOR_REP_SEAL" detail="BH-1 · Floor 3" />
              <VerifyRow ok label="PHONE_NUMBER" detail="+91 ••• •• 4421" />
              <VerifyRow label="GOVT_ID" detail="Optional, for big sales" />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="BADGES" />
            <CardBody className="grid grid-cols-3 gap-2">
              <Badge icon={<Award className="h-3 w-3" />} variant="signal" size="sm">TOP_SELLER</Badge>
              <Badge icon={<Shield className="h-3 w-3" />} variant="info" size="sm">VERIFIED</Badge>
              <Badge icon={<TrendingUp className="h-3 w-3" />} variant="success" size="sm">FAST_RESPOND</Badge>
              <Badge icon={<Star className="h-3 w-3" />} variant="warning" size="sm">5_STAR</Badge>
              <Badge icon={<Activity className="h-3 w-3" />} variant="default" size="sm">ACTIVE</Badge>
              <Badge icon={<Clock className="h-3 w-3" />} variant="default" size="sm">EARLY</Badge>
            </CardBody>
          </Card>
        </aside>
      </div>
    </Page>
  );
}

function ProfileHeader({ user }: { user: ReturnType<typeof localStore.getUser> }) {
  if (!user) return null;
  return (
    <div className="relative overflow-hidden border border-line bg-ink-200">
      <div className="absolute inset-0 bg-dot-grid bg-dot-md opacity-30" aria-hidden />
      <div className="relative flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
        <Avatar src={user.avatar} name={user.name} size="2xl" status="online" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-mono text-[10px] uppercase tracking-[0.22em] text-signal">
            //FLOOR_RESIDENT
            {user.role === "admin" && <Badge variant="signal" size="xs">ADMIN</Badge>}
            {user.role === "moderator" && <Badge variant="info" size="xs">FLOOR_REP</Badge>}
            {user.verified && (
              <Badge variant="success" size="xs" dot pulse>
                VERIFIED
              </Badge>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            {user.name}
          </h1>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
            @{user.username} · {user.hostel.name} · ROOM {user.room} · {user.course} · YEAR {user.yearOfStudy}
          </div>
          {user.bio && <p className="mt-2 max-w-2xl text-sm text-fg-muted">{user.bio}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm" leftIcon={<MessageCircle className="h-3 w-3" />}>
            MESSAGE
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Edit3 className="h-3 w-3" />}>
            EDIT_PROFILE
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent: "signal" | "success" | "warning" | "cyan" }) {
  const accentMap = {
    signal: "border-signal/40 text-signal",
    success: "border-success/40 text-success",
    warning: "border-warning/40 text-warning",
    cyan: "border-cyan/40 text-cyan",
  } as const;
  return (
    <div className={`relative border border-line bg-surface p-4 ${accentMap[accent]}`}>
      <div className="font-mono text-[9px] uppercase tracking-[0.22em] opacity-70">{label}</div>
      <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-fg">{value}</div>
      <div className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-current animate-blink-dot" />
    </div>
  );
}

function VerifyRow({ ok, label, detail }: { ok?: boolean; label: string; detail: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border border-line bg-ink-100 p-2.5">
      <div className="flex items-center gap-2">
        {ok ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />
        ) : (
          <div className="h-3.5 w-3.5 rounded-full border border-line" />
        )}
        <div>
          <div className="text-mono text-[10px] uppercase tracking-[0.16em] text-fg">{label}</div>
          <div className="font-mono text-[9px] tracking-wide text-fg-subtle">{detail}</div>
        </div>
      </div>
      <ChevronRight className="h-3 w-3 text-fg-subtle" strokeWidth={1.5} />
    </div>
  );
}
