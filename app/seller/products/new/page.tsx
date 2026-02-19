"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type {
  Category,
  Subcategory,
  AttributeTemplate,
  ProductAttribute,
  ProductVariant,
  Product,
} from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "category" | "details" | "variants" | "images" | "review";

interface VariantDraft {
  tempId: string;
  label: string;
  price: string;
  stock: string;
  isDefault: boolean;
}

interface FormState {
  categoryId: string;
  subcategoryId: string;
  category: Category | null;
  subcategory: Subcategory | null;
  title: string;
  description: string;
  attributes: ProductAttribute[];
  productId: string | null;
  variants: VariantDraft[];
  uploadedImages: { id: string; url: string }[];
  imageFiles: File[];
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS: { key: Step; label: string }[] = [
  { key: "category", label: "Category" },
  { key: "details", label: "Details" },
  { key: "variants", label: "Variants" },
  { key: "images", label: "Images" },
  { key: "review", label: "Review" },
];

function StepBar({ current }: { current: Step }) {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                i < idx
                  ? "bg-success text-white"
                  : i === idx
                    ? "bg-brand text-foreground"
                    : "bg-[#f2f2f2] text-muted"
              }`}
            >
              {i < idx ? (
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-sm font-medium ${i === idx ? "text-foreground" : "text-muted"}`}
            >
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-6 ${i < idx ? "bg-success" : "bg-border"}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 1: Category ─────────────────────────────────────────────────────────

function CategoryStep({
  form,
  onNext,
}: {
  form: FormState;
  onNext: (updated: Partial<FormState>) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCatId, setSelectedCatId] = useState(form.categoryId);
  const [selectedSubId, setSelectedSubId] = useState(form.subcategoryId);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Category[]>("/categories")
      .then(setCategories)
      .catch(() => setError("Failed to load categories"))
      .finally(() => setLoading(false));
  }, []);

  const selectedCat = categories.find((c) => c.id === selectedCatId) ?? null;
  const selectedSub =
    selectedCat?.subcategories.find((s) => s.id === selectedSubId) ?? null;

  async function handleNext() {
    if (!selectedCatId || !selectedSubId) {
      setError("Please select a category and subcategory.");
      return;
    }
    // Load subcategory with attribute templates
    try {
      const sub = await api.get<Subcategory>(
        `/categories/${selectedCatId}/subcategories/${selectedSubId}`
      );
      onNext({
        categoryId: selectedCatId,
        subcategoryId: selectedSubId,
        category: selectedCat,
        subcategory: sub,
      });
    } catch {
      setError("Failed to load subcategory details.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Choose a Category</h2>
        <p className="mt-1 text-sm text-muted">
          Select the category and subcategory that best fits your product.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      {/* Category cards */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Main Category
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCatId(cat.id);
                setSelectedSubId("");
                setError("");
              }}
              className={`rounded-2xl border p-4 text-left transition-all ${
                selectedCatId === cat.id
                  ? "border-brand bg-brand-light shadow-sm"
                  : "border-border bg-white hover:border-brand/40"
              }`}
            >
              <p className="font-medium">{cat.name}</p>
              <p className="mt-0.5 text-xs text-muted">
                {cat.subcategories.length} subcategorie
                {cat.subcategories.length !== 1 ? "s" : ""}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory */}
      {selectedCat && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            Subcategory
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {selectedCat.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => {
                  setSelectedSubId(sub.id);
                  setError("");
                }}
                className={`rounded-xl border p-3 text-left text-sm transition-all ${
                  selectedSubId === sub.id
                    ? "border-brand bg-brand-light font-medium"
                    : "border-border bg-white hover:border-brand/40"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          disabled={!selectedCatId || !selectedSubId}
          className="btn-brand disabled:opacity-40"
        >
          Continue
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
      </div>

      {selectedSub && (
        <div className="rounded-xl border border-brand/20 bg-brand-light/50 p-4 text-sm">
          <p className="font-medium">{selectedSub.name}</p>
          <p className="mt-1 text-muted">
            Selected — click Continue to add product details.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Details ──────────────────────────────────────────────────────────

function DetailsStep({
  form,
  onBack,
  onNext,
}: {
  form: FormState;
  onBack: () => void;
  onNext: (updated: Partial<FormState>, productId: string) => void;
}) {
  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description);
  const [attrValues, setAttrValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    form.attributes.forEach((a) => {
      init[a.key] = a.value;
    });
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const templates: AttributeTemplate[] =
    form.subcategory?.attributeTemplates ?? [];

  async function handleNext() {
    setError("");
    if (!title.trim()) return setError("Product title is required.");
    if (description.trim().length < 20)
      return setError("Description must be at least 20 characters.");

    const requiredMissing = templates
      .filter((t) => t.isRequired)
      .find((t) => !attrValues[t.key]?.trim());
    if (requiredMissing)
      return setError(`"${requiredMissing.label}" is required.`);

    const attributes: ProductAttribute[] = templates
      .filter((t) => attrValues[t.key]?.trim())
      .map((t) => ({
        key: t.key,
        label: t.label,
        type: t.type,
        value: attrValues[t.key].trim(),
      }));

    setSaving(true);
    try {
      let productId: string;
      if (form.productId) {
        // Update existing draft — keep the same id
        await api.patch(`/products/${form.productId}`, {
          title: title.trim(),
          description: description.trim(),
          categoryId: form.categoryId,
          subcategoryId: form.subcategoryId,
          attributes,
        });
        productId = form.productId;
      } else {
        // Create new draft — response shape: { message, product: { id, ... } }
        const result = await api.post<{ message: string; product: Product }>(
          "/products",
          {
            title: title.trim(),
            description: description.trim(),
            categoryId: form.categoryId,
            subcategoryId: form.subcategoryId,
            attributes,
          }
        );
        productId = result.product.id;
      }
      onNext(
        { title: title.trim(), description: description.trim(), attributes },
        productId
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Product Details</h2>
        <p className="mt-1 text-sm text-muted">
          {form.category?.name} → {form.subcategory?.name}
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      <div className="space-y-5">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted uppercase tracking-wider">
            Product Title *
          </label>
          <input
            className="input-underline"
            placeholder="e.g. Premium Kashmiri Saffron"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-muted uppercase tracking-wider">
            Description * (min 20 chars)
          </label>
          <textarea
            className="textarea-underline"
            placeholder="Describe your product — origin, materials, craftsmanship, what makes it special..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
          />
          <p className="mt-1 text-right text-xs text-muted">
            {description.length}/2000
          </p>
        </div>

        {/* Dynamic attributes */}
        {templates.length > 0 && (
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Product Attributes
            </p>
            {templates.map((t) => (
              <div key={t.key}>
                <label className="mb-1 block text-xs font-semibold text-muted uppercase tracking-wider">
                  {t.label}
                  {t.isRequired ? " *" : " (optional)"}
                  {t.unit ? ` (${t.unit})` : ""}
                </label>
                {t.type === "LONG_TEXT" ? (
                  <textarea
                    className="textarea-underline"
                    rows={3}
                    placeholder={`Enter ${t.label.toLowerCase()}…`}
                    value={attrValues[t.key] ?? ""}
                    onChange={(e) =>
                      setAttrValues((prev) => ({
                        ...prev,
                        [t.key]: e.target.value,
                      }))
                    }
                  />
                ) : t.type === "BOOLEAN" ? (
                  <div className="flex gap-4 py-2">
                    {["Yes", "No"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={t.key}
                          value={opt}
                          checked={attrValues[t.key] === opt}
                          onChange={() =>
                            setAttrValues((prev) => ({
                              ...prev,
                              [t.key]: opt,
                            }))
                          }
                          className="accent-brand"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type={t.type === "NUMBER" ? "number" : "text"}
                    className="input-underline"
                    placeholder={`Enter ${t.label.toLowerCase()}…`}
                    value={attrValues[t.key] ?? ""}
                    onChange={(e) =>
                      setAttrValues((prev) => ({
                        ...prev,
                        [t.key]: e.target.value,
                      }))
                    }
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="btn-outline">
          Back
        </button>
        <button onClick={handleNext} disabled={saving} className="btn-brand">
          {saving ? "Saving..." : "Continue"}
          {!saving && (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Variants ─────────────────────────────────────────────────────────

function VariantsStep({
  form,
  onBack,
  onNext,
}: {
  form: FormState;
  onBack: () => void;
  onNext: (variants: VariantDraft[]) => void;
}) {
  const [variants, setVariants] = useState<VariantDraft[]>(
    form.variants.length > 0
      ? form.variants
      : [
          {
            tempId: crypto.randomUUID(),
            label: "",
            price: "",
            stock: "",
            isDefault: true,
          },
        ]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        label: "",
        price: "",
        stock: "",
        isDefault: false,
      },
    ]);
  }

  function removeVariant(tempId: string) {
    setVariants((prev) => {
      const next = prev.filter((v) => v.tempId !== tempId);
      // Ensure one is default
      if (next.length > 0 && !next.some((v) => v.isDefault)) {
        next[0].isDefault = true;
      }
      return next;
    });
  }

  function setDefault(tempId: string) {
    setVariants((prev) =>
      prev.map((v) => ({ ...v, isDefault: v.tempId === tempId }))
    );
  }

  function updateVariant(tempId: string, field: keyof VariantDraft, value: string | boolean) {
    setVariants((prev) =>
      prev.map((v) => (v.tempId === tempId ? { ...v, [field]: value } : v))
    );
  }

  async function handleNext() {
    setError("");
    const invalid = variants.find(
      (v) => !v.label.trim() || !v.price || !v.stock
    );
    if (invalid)
      return setError("All variants need a label, price, and stock quantity.");
    if (!form.productId) return setError("Product not created yet.");

    setSaving(true);
    try {
      // Post each variant to the API
      for (const v of variants) {
        await api.post(`/products/${form.productId}/variants`, {
          label: v.label.trim(),
          price: parseFloat(v.price),
          stock: parseInt(v.stock, 10),
          isDefault: v.isDefault,
        });
      }
      onNext(variants);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save variants.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Add Variants</h2>
        <p className="mt-1 text-sm text-muted">
          Variants represent different sizes, weights, or options for your
          product. Add at least one.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      <div className="space-y-4">
        {variants.map((v, i) => (
          <div
            key={v.tempId}
            className={`rounded-2xl border p-5 ${v.isDefault ? "border-brand bg-brand-light/30" : "border-border bg-white"}`}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold">
                Variant {i + 1}
                {v.isDefault && (
                  <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    Default
                  </span>
                )}
              </p>
              <div className="flex items-center gap-3">
                {!v.isDefault && (
                  <button
                    onClick={() => setDefault(v.tempId)}
                    className="text-xs text-brand-dark underline underline-offset-2"
                  >
                    Set as default
                  </button>
                )}
                {variants.length > 1 && (
                  <button
                    onClick={() => removeVariant(v.tempId)}
                    className="text-xs text-error underline underline-offset-2"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                  Label *
                </label>
                <input
                  className="input-underline"
                  placeholder="e.g. 10 grams, Small, Red"
                  value={v.label}
                  onChange={(e) =>
                    updateVariant(v.tempId, "label", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  className="input-underline"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={v.price}
                  onChange={(e) =>
                    updateVariant(v.tempId, "price", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                  Stock *
                </label>
                <input
                  type="number"
                  className="input-underline"
                  placeholder="0"
                  min="0"
                  step="1"
                  value={v.stock}
                  onChange={(e) =>
                    updateVariant(v.tempId, "stock", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addVariant}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 text-sm text-muted transition-colors hover:border-brand hover:text-foreground"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add another variant
        </button>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="btn-outline">
          Back
        </button>
        <button onClick={handleNext} disabled={saving} className="btn-brand">
          {saving ? "Saving..." : "Continue"}
          {!saving && (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Images ───────────────────────────────────────────────────────────

function ImagesStep({
  form,
  onBack,
  onNext,
}: {
  form: FormState;
  onBack: () => void;
  onNext: (images: { id: string; url: string }[]) => void;
}) {
  const [previews, setPreviews] = useState<
    { file: File; previewUrl: string }[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<
    { id: string; url: string }[]
  >(form.uploadedImages);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const maxMore = 10 - uploadedImages.length - previews.length;
    const limited = files.slice(0, maxMore);
    const newPreviews = limited.map((f) => ({
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  }

  function removePreview(idx: number) {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  }

  async function handleUpload() {
    if (!form.productId) return;
    if (previews.length === 0) return onNext(uploadedImages);

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      previews.forEach((p) => formData.append("images", p.file));
      const result = await api.postForm<{ images: { id: string; url?: string; secureUrl?: string }[] }>(
        `/products/${form.productId}/images`,
        formData
      );
      const newImages = (result.images ?? []).map((img) => ({
        id: img.id,
        url: img.url ?? img.secureUrl ?? "",
      }));
      const all = [...uploadedImages, ...newImages];
      setUploadedImages(all);
      setPreviews([]);
      onNext(all);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const totalImages = uploadedImages.length + previews.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Product Images</h2>
        <p className="mt-1 text-sm text-muted">
          Upload up to 10 photos. Clear, well-lit images help buyers trust your
          product. Accepted: JPEG, PNG, WebP — max 10 MB each.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      {/* Upload zone */}
      {totalImages < 10 && (
        <div
          onClick={() => fileRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand/30 bg-brand-light/30 py-10 transition-colors hover:border-brand hover:bg-brand-light/50"
        >
          <svg
            className="mb-3 h-8 w-8 text-brand-dark"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <p className="font-medium text-sm">Click to add photos</p>
          <p className="mt-1 text-xs text-muted">
            {10 - totalImages} slot{10 - totalImages !== 1 ? "s" : ""} remaining
          </p>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Already-uploaded */}
      {uploadedImages.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Uploaded
          </p>
          <div className="flex flex-wrap gap-3">
            {uploadedImages.map((img) => (
              <div
                key={img.id}
                className="relative h-24 w-24 overflow-hidden rounded-xl border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt="product"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending previews */}
      {previews.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Ready to upload
          </p>
          <div className="flex flex-wrap gap-3">
            {previews.map((p, i) => (
              <div
                key={i}
                className="group relative h-24 w-24 overflow-hidden rounded-xl border border-brand/30"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.previewUrl}
                  alt="preview"
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => removePreview(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="btn-outline">
          Back
        </button>
        <div className="flex gap-3">
          {previews.length === 0 && (
            <button
              onClick={() => onNext(uploadedImages)}
              className="btn-outline"
            >
              Skip for now
            </button>
          )}
          <button
            onClick={handleUpload}
            disabled={uploading || (previews.length === 0 && uploadedImages.length === 0)}
            className="btn-brand"
          >
            {uploading
              ? "Uploading..."
              : previews.length > 0
                ? `Upload ${previews.length} photo${previews.length !== 1 ? "s" : ""}`
                : "Continue"}
            {!uploading && (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Review ───────────────────────────────────────────────────────────

function ReviewStep({
  form,
  onBack,
  onDone,
}: {
  form: FormState;
  onBack: () => void;
  onDone: (published: boolean) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handlePublish() {
    if (!form.productId) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post(`/products/${form.productId}/publish`);
      onDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit for review.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSaveDraft() {
    onDone(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Review & Submit</h2>
        <p className="mt-1 text-sm text-muted">
          Check your product details before submitting for admin review.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      <div className="space-y-4">
        {/* Basic info */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            Product Info
          </p>
          <p className="font-semibold text-lg">{form.title}</p>
          <p className="mt-1 text-sm text-muted">
            {form.category?.name} → {form.subcategory?.name}
          </p>
          <p className="mt-3 text-sm">{form.description}</p>
        </div>

        {/* Attributes */}
        {form.attributes.length > 0 && (
          <div className="rounded-2xl border border-border bg-white p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
              Attributes
            </p>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {form.attributes.map((a) => (
                <div key={a.key}>
                  <dt className="text-xs text-muted">{a.label}</dt>
                  <dd className="mt-0.5 text-sm font-medium">{a.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Variants */}
        {form.variants.length > 0 && (
          <div className="rounded-2xl border border-border bg-white p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
              Variants ({form.variants.length})
            </p>
            <div className="divide-y divide-border">
              {form.variants.map((v) => (
                <div
                  key={v.tempId}
                  className="flex items-center justify-between py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{v.label}</span>
                    {v.isDefault && (
                      <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted">
                    ₹{parseFloat(v.price).toLocaleString("en-IN")} &nbsp;·&nbsp;{v.stock} in
                    stock
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Images */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            Images ({form.uploadedImages.length})
          </p>
          {form.uploadedImages.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {form.uploadedImages.map((img) => (
                <div
                  key={img.id}
                  className="h-16 w-16 overflow-hidden rounded-lg border border-border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt="product"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">
              No images uploaded — you can add them later.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
        <button onClick={onBack} className="btn-outline">
          Back
        </button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button onClick={handleSaveDraft} className="btn-primary">
            Save as Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={submitting}
            className="btn-brand"
          >
            {submitting ? "Submitting..." : "Submit for Review"}
            {!submitting && (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NewProductPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("category");
  const [form, setForm] = useState<FormState>({
    categoryId: "",
    subcategoryId: "",
    category: null,
    subcategory: null,
    title: "",
    description: "",
    attributes: [],
    productId: null,
    variants: [],
    uploadedImages: [],
    imageFiles: [],
  });
  const [done, setDone] = useState<{ published: boolean } | null>(null);

  function updateForm(partial: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <svg
            className="h-8 w-8 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold">
          {done.published ? "Product submitted for review!" : "Draft saved!"}
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted">
          {done.published
            ? "Our team will review your product and notify you by email once a decision is made."
            : "Your product has been saved as a draft. You can publish it anytime."}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              setDone(null);
              setStep("category");
              setForm({
                categoryId: "",
                subcategoryId: "",
                category: null,
                subcategory: null,
                title: "",
                description: "",
                attributes: [],
                productId: null,
                variants: [],
                uploadedImages: [],
                imageFiles: [],
              });
            }}
            className="btn-outline"
          >
            Add Another Product
          </button>
          <button
            onClick={() => router.push("/seller/products")}
            className="btn-brand"
          >
            View Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">New Product</h1>
        <p className="mt-1 text-sm text-muted">
          Fill in the details below to list a new craft product.
        </p>
      </div>

      <StepBar current={step} />

      <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
        {step === "category" && (
          <CategoryStep
            form={form}
            onNext={(updated) => {
              updateForm(updated);
              setStep("details");
            }}
          />
        )}

        {step === "details" && (
          <DetailsStep
            form={form}
            onBack={() => setStep("category")}
            onNext={(updated, productId) => {
              updateForm({ ...updated, productId });
              setStep("variants");
            }}
          />
        )}

        {step === "variants" && (
          <VariantsStep
            form={form}
            onBack={() => setStep("details")}
            onNext={(variants) => {
              updateForm({ variants });
              setStep("images");
            }}
          />
        )}

        {step === "images" && (
          <ImagesStep
            form={form}
            onBack={() => setStep("variants")}
            onNext={(images) => {
              updateForm({ uploadedImages: images });
              setStep("review");
            }}
          />
        )}

        {step === "review" && (
          <ReviewStep
            form={form}
            onBack={() => setStep("images")}
            onDone={(published) => setDone({ published })}
          />
        )}
      </div>
    </div>
  );
}
