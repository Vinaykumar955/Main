import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  Flame,
  FlameKindling,
  Info,
  Repeat,
  Save,
  Sparkles,
  Tag,
  Wand2,
  X,
} from "lucide-react";
import { createListingSchema, type CreateListingInput } from "./listingService";
import { useCategories, useCreateListing } from "./useListings";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { ImageUploader } from "./ImageUploader";
import { Page, PageHeader, PageSection } from "@/components/layout/Page";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tag as TagUI } from "@/components/ui/Tag";
import { Separator } from "@/components/ui/Separator";
import { cn, formatPrice } from "@/lib/utils";
import { useToastStore } from "@/store";
import { Sparkline } from "@/components/ui/Sparkline";
import { MetaCell, LEDCounter } from "@/components/ui/Atoms";

const STEPS = [
  { id: 0, label: "Item" },
  { id: 1, label: "Photos" },
  { id: 2, label: "Price" },
  { id: 3, label: "Logistics" },
  { id: 4, label: "Review" },
] as const;

const SUGGESTED_TAGS = [
  "urgent",
  "no-haggle",
  "cash-on-pickup",
  "with-original-box",
  "warranty",
  "moving-out",
  "wfh-essential",
  "freshie-kit",
];

export function CreateListingPage() {
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const create = useCreateListing();
  const push = useToastStore((s) => s.push);
  const [step, setStep] = useState(0);

  const form = useForm<CreateListingInput>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      isFree: false,
      negotiable: true,
      urgent: false,
      swapAvailable: false,
      condition: "good",
      category: "",
      tags: [],
      images: [],
      hostel: "NC 1",
      room: "",
    },
    mode: "onBlur",
  });

  const { control, register, handleSubmit, watch, setValue, formState: { errors }, getValues } = form;
  const data = watch();

  const next = async () => {
    const fields: (keyof CreateListingInput)[][] = [
      ["title", "description", "category", "condition"],
      ["images"],
      ["price"],
      ["hostel"],
    ];
    const ok = await form.trigger(fields[step]);
    if (ok) setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = (values: CreateListingInput) => {
    create.mutate(values, {
      onSuccess: (listing) => {
        push({ type: "success", title: "LISTING_POSTED", body: "Now visible to your floor." });
        navigate(`/listing/${listing.id}`);
      },
    });
  };

  const setTag = (t: string) => {
    const cur = getValues("tags");
    if (cur.includes(t)) {
      setValue("tags", cur.filter((x) => x !== t), { shouldValidate: true });
    } else if (cur.length < 8) {
      setValue("tags", [...cur, t], { shouldValidate: true });
    }
  };

  return (
    <Page>
      <PageHeader
        eyebrow="//POST_ITEM"
        title="List something"
        description="Five quick steps. Most students finish in under two minutes."
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1 h-3 w-3" /> BACK
          </Button>
        }
      />

      <Stepper current={step} />

      <form
        onSubmit={handleSubmit(submit)}
        className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]"
        noValidate
      >
        <div className="space-y-4">
          {step === 0 && <StepItem register={register} errors={errors} control={control} categories={categories ?? []} />}
          {step === 1 && (
            <Card>
              <CardHeader title="PHOTOS" meta="01–06 IMAGES" />
              <CardBody>
                <Controller
                  control={control}
                  name="images"
                  render={({ field }) => (
                    <ImageUploader value={field.value} onChange={field.onChange} max={6} />
                  )}
                />
                {errors.images?.message && (
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-signal">
                    &gt; {errors.images.message}
                  </p>
                )}
              </CardBody>
            </Card>
          )}
          {step === 2 && <StepPrice register={register} control={control} setValue={setValue} watch={data} />}
          {step === 3 && <StepLogistics register={register} control={control} setTag={setTag} tags={data.tags} />}
          {step === 4 && <StepReview data={data} categories={categories ?? []} />}
        </div>

        <aside className="space-y-3">
          <Card>
            <CardHeader title="NAVIGATION" />
            <CardBody className="space-y-2.5">
              {STEPS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={cn(
                    "group flex w-full items-center gap-2 border px-2.5 py-1.5 text-left transition-colors",
                    s.id === step
                      ? "border-signal bg-ink-200"
                      : "border-line text-fg-muted hover:border-fg-subtle hover:text-fg",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-5 w-5 shrink-0 place-items-center border text-[9px] tabular-nums",
                      s.id < step
                        ? "border-success bg-success text-ink"
                        : s.id === step
                          ? "border-signal bg-signal text-ink"
                          : "border-line text-fg-subtle",
                    )}
                  >
                    {s.id < step ? <Check className="h-3 w-3" /> : s.id + 1}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em]">{s.label}</span>
                </button>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="SMART_TIPS" />
            <CardBody className="space-y-2 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
              <Tip icon={<Eye className="h-3 w-3" />}>Listings with 4+ photos sell 3.2× faster.</Tip>
              <Tip icon={<Wand2 className="h-3 w-3" />}>Be honest about condition — trust compounds.</Tip>
              <Tip icon={<Sparkles className="h-3 w-3" />}>Use "URGENT" only when leaving soon.</Tip>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="DRAFT" />
            <CardBody>
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
                <span>SAVED_TO_LOCAL</span>
                <span className="tabular-nums">03s ago</span>
              </div>
              <Separator variant="dot" className="my-2" />
              <div className="grid grid-cols-2 gap-2">
                <MetaCell label="EST_PRICE" value={formatPrice(data.price || 0)} />
                <MetaCell label="IMAGES" value={`${data.images.length}/6`} />
                <MetaCell label="TAGS" value={`${data.tags.length}/8`} />
                <MetaCell label="URGENT" value={data.urgent ? "YES" : "NO"} />
              </div>
            </CardBody>
          </Card>
        </aside>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between border border-line bg-ink-200 p-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={back}
              disabled={step === 0}
              leftIcon={<ArrowLeft className="h-3 w-3" />}
            >
              BACK
            </Button>
            <div className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle sm:block">
              STEP <span className="text-fg">{String(step + 1).padStart(2, "0")}</span> / {String(STEPS.length).padStart(2, "0")}
            </div>
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={next}
                rightIcon={<ArrowRight className="h-3 w-3" />}
              >
                NEXT
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={create.isPending}
                rightIcon={<Save className="h-3 w-3" />}
              >
                PUBLISH
              </Button>
            )}
          </div>
        </div>
      </form>
    </Page>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto border border-line bg-ink-200 p-2 scrollbar-hide">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex flex-1 items-center gap-2">
          <div
            className={cn(
              "grid h-7 w-7 shrink-0 place-items-center border font-mono text-[10px] tabular-nums",
              i < current
                ? "border-success bg-success text-ink"
                : i === current
                  ? "border-signal bg-signal text-ink"
                  : "border-line text-fg-subtle",
            )}
          >
            {i < current ? <Check className="h-3 w-3" /> : i + 1}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-fg-subtle">
              STEP {String(i + 1).padStart(2, "0")}
            </div>
            <div className="truncate text-xs uppercase tracking-wide text-fg">{s.label}</div>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn("h-px flex-1", i < current ? "bg-success" : "bg-line")} />
          )}
        </div>
      ))}
    </div>
  );
}

function StepItem({
  register,
  errors,
  control,
  categories,
}: {
  register: ReturnType<typeof useForm<CreateListingInput>>["register"];
  errors: ReturnType<typeof useForm<CreateListingInput>>["formState"]["errors"];
  control: ReturnType<typeof useForm<CreateListingInput>>["control"];
  categories: { id: string; slug: string; name: string; icon: string }[];
}) {
  return (
    <Card>
      <CardHeader title="THE_ITEM" meta="TITLE / DESC / CATEGORY" />
      <CardBody className="space-y-4">
        <Input
          label="TITLE"
          placeholder="e.g. JBL Go 3 speaker — barely used"
          hint="Be specific. Brand, model, condition in one line."
          error={errors.title?.message}
          maxLength={100}
          {...register("title")}
        />
        <Textarea
          label="DESCRIPTION"
          placeholder="Tell the story. Why are you selling? Any quirks? When can buyers test it?"
          rows={6}
          maxLength={2000}
          maxLengthCounter
          error={errors.description?.message}
          {...register("description")}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select
                label="CATEGORY"
                options={[
                  { value: "", label: "Pick a category" },
                  ...categories.map((c) => ({ value: c.slug, label: c.name })),
                ]}
                error={errors.category?.message}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Controller
            control={control}
            name="condition"
            render={({ field }) => (
              <Select
                label="CONDITION"
                options={[
                  { value: "new", label: "New · sealed" },
                  { value: "likeNew", label: "Like new · used a few times" },
                  { value: "good", label: "Good · light wear" },
                  { value: "fair", label: "Fair · visible wear" },
                  { value: "poor", label: "Poor · works, rough" },
                ]}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </div>
      </CardBody>
    </Card>
  );
}

function StepPrice({
  register,
  control,
  setValue,
  watch,
}: {
  register: ReturnType<typeof useForm<CreateListingInput>>["register"];
  control: ReturnType<typeof useForm<CreateListingInput>>["control"];
  setValue: ReturnType<typeof useForm<CreateListingInput>>["setValue"];
  watch: CreateListingInput;
}) {
  const sparkData = Array.from({ length: 18 }, (_, i) => 12 + Math.sin(i / 1.5) * 3 + (i / 5));

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader title="PRICING" meta="₹ INR" />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              label="PRICE (₹)"
              type="number"
              inputMode="numeric"
              placeholder="0"
              hint="0 = free"
              error=""
              monospace
              leftAddon={<span className="font-mono text-xs">₹</span>}
              {...register("price", { valueAsNumber: true })}
            />
            <div className="flex items-end">
              <Controller
                control={control}
                name="isFree"
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => {
                      field.onChange(!field.value);
                      if (!field.value) setValue("price", 0);
                    }}
                    className={cn(
                      "inline-flex h-10 items-center gap-1.5 border px-3 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
                      watch.isFree
                        ? "border-success bg-success/10 text-success"
                        : "border-line text-fg-muted hover:border-fg-subtle hover:text-fg",
                    )}
                  >
                    <Sparkles className="h-3 w-3" strokeWidth={1.5} />
                    GIVE_FOR_FREE
                  </button>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Controller
              control={control}
              name="negotiable"
              render={({ field }) => (
                <Toggle
                  label="NEGOTIABLE"
                  description="Buyers can offer less"
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="urgent"
              render={({ field }) => (
                <Toggle
                  label={<span className="inline-flex items-center gap-1.5"><Flame className="h-3 w-3" /> URGENT</span>}
                  description="Leaving soon, sell fast"
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="swapAvailable"
              render={({ field }) => (
                <Toggle
                  label={<span className="inline-flex items-center gap-1.5"><Repeat className="h-3 w-3" /> OPEN_TO_SWAP</span>}
                  description="Trade for similar items"
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="MARKET_PULSE" meta="SAME_CATEGORY · 14D" />
        <CardBody>
          <div className="grid grid-cols-3 gap-2">
            <MetaCell label="MEDIAN" value="₹1,200" />
            <MetaCell label="FAST_SELL" value="₹900" />
            <MetaCell label="SOLD_RATE" value="68%" />
          </div>
          <Separator variant="dot" className="my-3" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-fg-subtle">
              DEMAND_14D
            </span>
            <Sparkline values={sparkData} width={140} height={32} stroke="var(--color-signal)" />
          </div>
          <p className="mt-2 font-mono text-[10px] tracking-wide text-fg-subtle">
            &gt; Items at ₹{watch.price || 0} are priced in the {watch.price && watch.price < 1000 ? "fast-sell" : "mid"} band. Adjust if selling slowly.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

function StepLogistics({
  register,
  control,
  setTag,
  tags,
}: {
  register: ReturnType<typeof useForm<CreateListingInput>>["register"];
  control: ReturnType<typeof useForm<CreateListingInput>>["control"];
  setTag: (t: string) => void;
  tags: string[];
}) {
  return (
    <div className="space-y-3">
      <Card>
        <CardHeader title="PICKUP" meta="WHERE / WHEN" />
        <CardBody className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Controller
                control={control}
                name="hostel"
                render={({ field }) => (
                  <Select
                    label="HOSTEL"
                    options={[
                      { value: "NC 1", label: "NC 1" },
                      { value: "NC 2", label: "NC 2" },
                      { value: "NC 3", label: "NC 3" },
                      { value: "NC 4", label: "NC 4" },
                      { value: "NC 5", label: "NC 5" },
                      { value: "NC 6", label: "NC 6" },
                      { value: "Zakir A", label: "Zakir A" },
                      { value: "Zakir B", label: "Zakir B" },
                      { value: "Zakir C", label: "Zakir C" },
                      { value: "Zakir D", label: "Zakir D" },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            <Input
              label="ROOM (OPTIONAL)"
              placeholder="B-204"
              monospace
              {...register("room")}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="TAGS" meta={`${tags.length}/8`} />
        <CardBody>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_TAGS.map((t) => {
              const active = tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={cn(
                    "inline-flex h-7 items-center gap-1.5 border px-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
                    active
                      ? "border-signal bg-signal text-ink"
                      : "border-line text-fg-muted hover:border-fg-subtle hover:text-fg",
                  )}
                >
                  <Tag className="h-2.5 w-2.5" strokeWidth={1.5} />
                  {t}
                  {active && <X className="h-2.5 w-2.5" strokeWidth={2} />}
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function StepReview({
  data,
  categories,
}: {
  data: CreateListingInput;
  categories: { id: string; slug: string; name: string }[];
}) {
  const category = categories.find((c) => c.slug === data.category);
  return (
    <Card>
      <CardHeader title="REVIEW" meta="ONE_LAST_LOOK" />
      <CardBody className="space-y-3">
        <div className="border border-line bg-ink-200 p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
            {category?.name ?? "CATEGORY"}
          </div>
          <h2 className="mt-1 text-xl font-semibold text-fg">{data.title || "Untitled"}</h2>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold tabular-nums text-fg">
              {formatPrice(data.price)}
            </span>
            {data.negotiable && <Badge variant="info" size="xs">NEG</Badge>}
            {data.urgent && <Badge variant="danger" size="xs" dot pulse>URGENT</Badge>}
            {data.swapAvailable && <Badge variant="info" size="xs">SWAP</Badge>}
            {data.isFree && <Badge variant="success" size="xs">FREE</Badge>}
          </div>
          <p className="mt-3 whitespace-pre-line text-sm text-fg-muted">
            {data.description || "No description yet."}
          </p>
          {data.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.tags.map((t) => (
                <TagUI key={t} variant="default" size="sm">#{t}</TagUI>
              ))}
            </div>
          )}
          <Separator variant="dot" className="my-3" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MetaCell label="CONDITION" value={data.condition.toUpperCase()} />
            <MetaCell label="HOSTEL" value={data.hostel} />
            <MetaCell label="ROOM" value={data.room || "—"} />
            <MetaCell label="IMAGES" value={`${data.images.length}/6`} />
          </div>
        </div>

        <div className="flex items-start gap-2 border border-line bg-ink-100 p-3 font-mono text-[10px] tracking-wide text-fg-muted">
          <Info className="h-3 w-3 shrink-0 text-cyan" />
          <span>Posting commits to the floor's trust seal. Be honest, be reachable, be safe.</span>
        </div>
      </CardBody>
    </Card>
  );
}

function Tip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-cyan">{icon}</span>
      <span className="text-fg-muted">{children}</span>
    </div>
  );
}
