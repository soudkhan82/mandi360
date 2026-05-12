"use client";

import { useMemo, useState } from "react";

type SelectedImage = {
  file: File;
  preview: string;
};

export default function ImagePicker() {
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [error, setError] = useState("");

  const totalSizeMb = useMemo(() => {
    const bytes = images.reduce((sum, item) => sum + item.file.size, 0);
    return (bytes / (1024 * 1024)).toFixed(2);
  }, [images]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setError("");

    if (!files.length) {
      setImages([]);
      return;
    }

    if (files.length > 4) {
      setError("You can upload a maximum of 4 images.");
      e.target.value = "";
      setImages([]);
      return;
    }

    const invalid = files.find((file) => !file.type.startsWith("image/"));
    if (invalid) {
      setError("Only image files are allowed.");
      e.target.value = "";
      setImages([]);
      return;
    }

    const oversized = files.find((file) => file.size > 5 * 1024 * 1024);
    if (oversized) {
      setError("Each image must be 5MB or less.");
      e.target.value = "";
      setImages([]);
      return;
    }

    const mapped = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.preview));
      return mapped;
    });
  }

  return (
    <div className="md:col-span-2">
      <label className="mb-2 block text-sm font-medium text-slate-200">
        Upload Images (Max 4)
      </label>

      <input
        name="images"
        type="file"
        accept="image/*"
        multiple
        onChange={onChange}
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-emerald-400"
      />

      <p className="mt-2 text-xs text-slate-400">
        You can upload up to 4 images. JPG, PNG, WEBP supported. Max 5MB each.
      </p>

      {error ? (
        <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {images.length > 0 ? (
        <div className="mt-4">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
            <span>{images.length} image(s) selected</span>
            <span>{totalSizeMb} MB total</span>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {images.map((item, index) => (
              <div
                key={`${item.file.name}-${index}`}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"
              >
                <img
                  src={item.preview}
                  alt={item.file.name}
                  className="h-28 w-full object-cover"
                />
                <div className="p-2">
                  <p className="truncate text-xs text-slate-300">
                    {item.file.name}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
