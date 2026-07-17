import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Page } from "@/components/shared/Page";
import { Card, Button, Spinner } from "@/components/ui";
import { schemesService } from "@/services/schemes.service";
import { Scheme, SchemeCategory } from "@/services/types";

// Zod schema validation
const schemeSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  description: z.string().optional(),
  benefit: z.string().min(5, "Benefit details must be at least 5 characters long"),
  eligibility: z.string().min(5, "Eligibility criteria must be at least 5 characters long"),
  category: z.enum([
    "agriculture",
    "housing",
    "health",
    "education",
    "women",
    "employment",
    "other",
  ]),
  last_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date in YYYY-MM-DD format").or(z.literal("")),
  apply_url: z.string().url("Enter a valid URL (e.g. https://mahadbt.gov.in)").or(z.literal("")),
});

type SchemeFormValues = z.infer<typeof schemeSchema>;

export default function Schemes() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);

  // Fetch schemes
  const { data: response, isLoading } = useQuery({
    queryKey: ["schemes", categoryFilter],
    queryFn: () =>
      schemesService.getSchemes({
        category: categoryFilter !== "all" ? categoryFilter : undefined,
      }),
  });

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SchemeFormValues>({
    resolver: zodResolver(schemeSchema),
    defaultValues: {
      name: "",
      description: "",
      benefit: "",
      eligibility: "",
      category: "other",
      last_date: "",
      apply_url: "",
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Omit<Scheme, "id">) => schemesService.createScheme(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schemes"] });
      closeForm();
      alert("Scheme added successfully!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Scheme> }) =>
      schemesService.updateScheme(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schemes"] });
      closeForm();
      alert("Scheme updated successfully!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => schemesService.deleteScheme(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schemes"] });
      alert("Scheme deleted successfully!");
    },
  });

  const openForm = (scheme?: Scheme) => {
    if (scheme) {
      setEditingScheme(scheme);
      setValue("name", scheme.name);
      setValue("description", scheme.description || "");
      setValue("benefit", scheme.benefit || "");
      setValue("eligibility", scheme.eligibility || "");
      setValue("category", scheme.category);
      setValue("last_date", scheme.last_date || "");
      setValue("apply_url", scheme.apply_url || "");
    } else {
      setEditingScheme(null);
      reset({
        name: "",
        description: "",
        benefit: "",
        eligibility: "",
        category: "other",
        last_date: "",
        apply_url: "",
      });
    }
    setShowFormModal(true);
  };

  const closeForm = () => {
    setShowFormModal(false);
    setEditingScheme(null);
  };

  const onSubmit = (data: SchemeFormValues) => {
    const formattedData = {
      ...data,
      description: data.description || null,
      last_date: data.last_date || null,
      apply_url: data.apply_url || null,
    };

    if (editingScheme) {
      updateMutation.mutate({ id: editingScheme.id, data: formattedData });
    } else {
      createMutation.mutate(formattedData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this scheme?")) {
      deleteMutation.mutate(id);
    }
  };

  const getCategoryBadge = (cat: SchemeCategory) => {
    const styles = {
      agriculture: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400",
      housing: "bg-blue-50 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400",
      health: "bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-400",
      education: "bg-purple-50 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400",
      women: "bg-pink-50 text-pink-800 dark:bg-pink-950/20 dark:text-pink-400",
      employment: "bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400",
      other: "bg-gray-50 text-gray-800 dark:bg-dark-700 dark:text-gray-300",
    };
    return (
      <span className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${styles[cat] || styles.other}`}>
        {cat}
      </span>
    );
  };

  const list = response?.data ?? [];
  const filteredList = list.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.description && s.description.toLowerCase().includes(term))
    );
  });

  return (
    <Page title="Welfare Schemes Catalog">
      <div className="transition-content w-full px-(--margin-x) pt-5 pb-8 lg:pt-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-dark-50">Welfare Schemes</h1>
            <p className="text-sm text-gray-500 dark:text-dark-300">
              Manage and index government welfare schemes, agricultural grants, housing funds, and educational benefits.
            </p>
          </div>

          <Button
            onClick={() => openForm()}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium self-start sm:self-auto"
          >
            <PlusIcon className="size-5" /> Add New Scheme
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <MagnifyingGlassIcon className="size-5" />
              </span>
              <input
                type="text"
                placeholder="Search scheme name, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
              >
                <option value="all">All Categories</option>
                <option value="agriculture">Agriculture</option>
                <option value="housing">Housing</option>
                <option value="health">Health & Medical</option>
                <option value="education">Education</option>
                <option value="women">Women Welfare</option>
                <option value="employment">Employment & Destitute</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Schemes Catalog List */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner className="size-10 text-emerald-600" />
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center text-gray-500 dark:text-dark-300">
            No welfare schemes are indexed. Use the button above to catalog a scheme.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredList.map((scheme) => (
              <Card
                key={scheme.id}
                className="flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    {getCategoryBadge(scheme.category)}
                    
                    {scheme.last_date && (
                      <span className="text-xs text-red-500 font-semibold bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded">
                        Deadline: {new Date(scheme.last_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-dark-50 leading-snug">
                    {scheme.name}
                  </h3>
                  
                  <p className="mt-2.5 text-sm text-gray-600 dark:text-dark-250 leading-relaxed">
                    {scheme.description}
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 border-t border-gray-100 pt-3 dark:border-dark-800">
                    <div>
                      <span className="block text-2xs uppercase tracking-wider text-gray-400 font-bold">Key Benefits</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-dark-100">{scheme.benefit}</span>
                    </div>
                    <div>
                      <span className="block text-2xs uppercase tracking-wider text-gray-400 font-bold">Eligibility</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-dark-100">{scheme.eligibility}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between bg-gray-50/50 dark:border-dark-800 dark:bg-dark-800/10">
                  {scheme.apply_url ? (
                    <a
                      href={scheme.apply_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    >
                      Official Apply Portal <ArrowTopRightOnSquareIcon className="size-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">Offline Application Only</span>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => openForm(scheme)}
                      className="text-gray-400 hover:text-gray-600 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-700"
                      title="Edit Scheme"
                    >
                      <PencilIcon className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(scheme.id)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                      title="Delete Scheme"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* CRUD Modal Form */}
        {showFormModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
            <Card className="w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={closeForm}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>

              <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-dark-50">
                {editingScheme ? "Edit Welfare Scheme" : "Index New Welfare Scheme"}
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Scheme Name</label>
                    <input
                      type="text"
                      {...register("name")}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                    />
                    {errors.name && <p className="mt-1 text-2xs text-red-500">{errors.name.message}</p>}
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Category</label>
                    <select
                      {...register("category")}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                    >
                      <option value="agriculture">Agriculture</option>
                      <option value="housing">Housing</option>
                      <option value="health">Health & Medical</option>
                      <option value="education">Education</option>
                      <option value="women">Women Welfare</option>
                      <option value="employment">Employment & Destitute</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Description</label>
                    <textarea
                      rows={3}
                      {...register("description")}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                    ></textarea>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Key Benefits</label>
                    <input
                      type="text"
                      {...register("benefit")}
                      placeholder="e.g. 50% subsidy, ₹5,000 grant"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                    />
                    {errors.benefit && <p className="mt-1 text-2xs text-red-500">{errors.benefit.message}</p>}
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Eligibility Criteria</label>
                    <input
                      type="text"
                      {...register("eligibility")}
                      placeholder="e.g. Income limit under 1 lakh"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                    />
                    {errors.eligibility && <p className="mt-1 text-2xs text-red-500">{errors.eligibility.message}</p>}
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Application Deadline (YYYY-MM-DD)</label>
                    <input
                      type="text"
                      placeholder="2026-08-30"
                      {...register("last_date")}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                    />
                    {errors.last_date && <p className="mt-1 text-2xs text-red-500">{errors.last_date.message}</p>}
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Official Portal Link</label>
                    <input
                      type="url"
                      placeholder="https://example.gov.in"
                      {...register("apply_url")}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                    />
                    {errors.apply_url && <p className="mt-1 text-2xs text-red-500">{errors.apply_url.message}</p>}
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-dark-800">
                  <Button type="button" variant="outlined" onClick={closeForm} className="h-10">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Catalog Scheme"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </Page>
  );
}
