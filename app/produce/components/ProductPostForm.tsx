"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  ImageIcon,
  Loader2,
  Store,
  Truck,
  Upload,
  Wheat,
} from "lucide-react";
import {
  attachProduceImageToListing,
  createProduceListing,
  uploadProduceImage,
  type CreateProduceListingInput,
} from "@/app/lib/produce/mutations";
import type {
  CityOption,
  ProduceCategoryOption,
} from "@/app/lib/produce/queries";

type Props = {
  categories: ProduceCategoryOption[];
  cities: CityOption[];
};

type FormState = {
  title: string;
  description: string;
  category_id: string;
  city_id: string;
  location: string;
  price_per_unit: string;
  price_unit: string;
  quantity: string;
  quantity_unit: string;
  seller_name: string;
  seller_phone: string;
  seller_type: string;
};

const initialForm: FormState = {
  title: "",
  description: "",
  category_id: "",
  city_id: "",
  location: "",
  price_per_unit: "",
  price_unit: "kg",
  quantity: "",
  quantity_unit: "kg",
  seller_name: "",
  seller_phone: "",
  seller_type: "Farmer",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function createSlugSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

export default function ProductPostForm({ categories, cities }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [slugSuffix, setSlugSuffix] = useState<string>(createSlugSuffix());

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === form.category_id) ?? null,
    [categories, form.category_id],
  );

  const selectedCity = useMemo(
    () => cities.find((item) => item.id === form.city_id) ?? null,
    [cities, form.city_id],
  );

  const generatedSlug = useMemo(() => {
    if (!form.title.trim()) return "";
    const cityPart =
      selectedCity?.slug || selectedCity?.name
        ? `-${slugify(selectedCity.slug || selectedCity.name)}`
        : "";
    return `${slugify(form.title)}${cityPart}-${slugSuffix}`;
  }, [form.title, selectedCity, slugSuffix]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateForm() {
    if (!form.title.trim()) return "Title is required.";
    if (!form.description.trim()) return "Description is required.";
    if (!form.category_id.trim()) return "Category is required.";
    if (!form.city_id.trim()) return "City is required.";
    if (!form.location.trim()) return "Location is required.";
    if (!form.price_per_unit.trim()) return "Price per unit is required.";
    if (!form.quantity.trim()) return "Quantity is required.";
    if (!form.seller_name.trim()) return "Contact name is required.";
    if (!form.seller_phone.trim()) return "Contact phone is required.";
    if (!imageFile) return "Please select a listing image.";

    const price = Number(form.price_per_unit);
    const quantity = Number(form.quantity);

    if (Number.isNaN(price) || price <= 0) {
      return "Price must be a valid positive number.";
    }

    if (Number.isNaN(quantity) || quantity <= 0) {
      return "Quantity must be a valid positive number.";
    }

    return "";
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setSubmitting(true);

      let uploadedImagePath = "";
      let uploadedImageUrl = "";

      if (imageFile) {
        const uploaded = await uploadProduceImage(imageFile);
        uploadedImagePath = uploaded.path;
        uploadedImageUrl = uploaded.publicUrl;
      }

      const payload: CreateProduceListingInput = {
        user_id: null,
        business_profile_id: null,
        category_id: form.category_id.trim(),
        city_id: form.city_id.trim(),
        mandi_id: null,
        title: form.title.trim(),
        slug: generatedSlug,
        description: form.description.trim(),
        quantity: Number(form.quantity),
        quantity_unit: form.quantity_unit,
        price_per_unit: Number(form.price_per_unit),
        price_unit: form.price_unit,
        minimum_order_quantity: Number(form.quantity) || null,
        contact_name: form.seller_name.trim(),
        contact_phone: form.seller_phone.trim(),
        contact_whatsapp: form.seller_phone.trim(),
        variety: null,
        grade: null,
        packaging_details: form.location.trim(),
        is_organic: false,
      };

      const created = await createProduceListing(payload);

      if (uploadedImageUrl && uploadedImagePath) {
        await attachProduceImageToListing({
          listing_id: created.id,
          file_path: uploadedImagePath,
          public_url: uploadedImageUrl,
          is_primary: true,
          sort_order: 0,
        });
      }

      setSuccessMessage("Produce listing submitted successfully.");
      setForm(initialForm);
      setImageFile(null);
      setImagePreview("");
      setSlugSuffix(createSlugSuffix());

      const targetSlug =
        typeof created?.slug === "string" && created.slug.trim().length > 0
          ? created.slug
          : payload.slug;

      setTimeout(() => {
        router.push(`/produce/${targetSlug}`);
        router.refresh();
      }, 700);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create listing.";
      setErrorMessage(message);
      setSlugSuffix(createSlugSuffix());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur sm:p-6"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-500/10 p-3">
            <Wheat className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              Listing Information
            </h2>
            <p className="text-sm text-slate-400">
              Enter produce details and upload a real listing image
            </p>
          </div>
        </div>

        <div className="grid gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Listing title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. Premium Loquat Lot"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/40"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={5}
              placeholder="Describe freshness, grade, availability, packaging, and dispatch details..."
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/40"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Category
              </label>
              <select
                value={form.category_id}
                onChange={(e) => updateField("category_id", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/40"
              >
                <option value="">Select category</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                City / mandi
              </label>
              <select
                value={form.city_id}
                onChange={(e) => updateField("city_id", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/40"
              >
                <option value="">Select city</option>
                {cities.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Location / packaging details
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="e.g. I-11 Sabzi Mandi, Islamabad"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/40"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Price per unit
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price_per_unit}
                onChange={(e) => updateField("price_per_unit", e.target.value)}
                placeholder="e.g. 180"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Price unit
              </label>
              <select
                value={form.price_unit}
                onChange={(e) => updateField("price_unit", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/40"
              >
                <option value="kg">kg</option>
                <option value="crate">crate</option>
                <option value="maund">maund</option>
                <option value="ton">ton</option>
                <option value="box">box</option>
              </select>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Quantity
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.quantity}
                onChange={(e) => updateField("quantity", e.target.value)}
                placeholder="e.g. 4000"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Quantity unit
              </label>
              <select
                value={form.quantity_unit}
                onChange={(e) => updateField("quantity_unit", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/40"
              >
                <option value="kg">kg</option>
                <option value="crate">crate</option>
                <option value="maund">maund</option>
                <option value="ton">ton</option>
                <option value="box">box</option>
              </select>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Contact name
              </label>
              <input
                type="text"
                value={form.seller_name}
                onChange={(e) => updateField("seller_name", e.target.value)}
                placeholder="Your contact name"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Contact phone
              </label>
              <input
                type="text"
                value={form.seller_phone}
                onChange={(e) => updateField("seller_phone", e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Seller type
              </label>
              <select
                value={form.seller_type}
                onChange={(e) => updateField("seller_type", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/40"
              >
                <option value="Farmer">Farmer</option>
                <option value="Wholesaler">Wholesaler</option>
                <option value="Commission Agent">Commission Agent</option>
                <option value="Retail Supplier">Retail Supplier</option>
                <option value="Trader">Trader</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
              <ImageIcon className="h-4 w-4" />
              Upload listing image
            </label>

            <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-slate-900 px-4 py-6 text-sm text-slate-300 transition hover:border-emerald-400/30 hover:bg-slate-900/80">
              <Upload className="h-4 w-4" />
              <span>
                {imageFile ? imageFile.name : "Choose image from your device"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            <p className="mt-2 text-xs text-slate-500">
              The selected image will be uploaded to Supabase Storage and linked
              to this listing.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Generated slug
            </label>
            <div className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-300">
              {generatedSlug || "Slug will appear here after title"}
            </div>
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {successMessage}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Listing
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setForm(initialForm);
                setImageFile(null);
                setImagePreview("");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Reset Form
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-sky-500/10 p-3">
              <Store className="h-5 w-5 text-sky-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Listing Preview
              </h3>
              <p className="text-sm text-slate-400">
                This is how your produce post starts to look
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
            <img
              src={
                imagePreview ||
                "https://placehold.co/1200x700/0f172a/e2e8f0?text=Produce+Image"
              }
              alt={form.title || "Produce preview"}
              className="h-64 w-full object-cover"
            />

            <div className="p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  {selectedCategory?.name || "Category"}
                </span>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                  {selectedCity?.name || "City"}
                </span>
              </div>

              <h4 className="text-xl font-semibold text-white">
                {form.title || "Your produce listing title"}
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {form.description ||
                  "Your produce description will appear here."}
              </p>

              <div className="mt-5 grid gap-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-slate-400">Price</span>
                  <p className="mt-1 font-semibold text-white">
                    {form.price_per_unit
                      ? `PKR ${Number(form.price_per_unit).toLocaleString()} / ${form.price_unit}`
                      : "PKR 0 / kg"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-slate-400">Quantity</span>
                  <p className="mt-1 font-semibold text-white">
                    {form.quantity
                      ? `${Number(form.quantity).toLocaleString()} ${form.quantity_unit}`
                      : `0 ${form.quantity_unit}`}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-slate-400">Contact</span>
                  <p className="mt-1 font-semibold text-white">
                    {form.seller_name || "Contact name"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-500/10 p-3">
              <Truck className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Posting Notes
              </h3>
              <p className="text-sm text-slate-400">
                Uploaded images will be stored in Supabase Storage
              </p>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
              Use real produce images for better trust and conversion.
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
              The image URL is stored in <code>produce_listing_images</code>,
              not in the main listing row.
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
              Category and city are now selected visually, but the form still
              submits the correct UUIDs internally.
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              This form is aligned with your normalized Supabase schema
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
