import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Page } from "@/components/shared/Page";
import { Card, Button, Spinner } from "@/components/ui";
import { useAuthContext } from "@/app/contexts/auth/context";
import { complaintsService } from "@/services/complaints.service";
import { ComplaintStatus } from "@/services/types";

export default function Complaints() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const panchayatId = user?.panchayat_id ?? 0; // 0 = Super Admin (all)

  // Filters state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Selected complaint for detail view
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [remarkInput, setRemarkInput] = useState<string>("");
  const [statusInput, setStatusInput] = useState<ComplaintStatus>("open");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Fetch complaints
  const { data: response, isLoading } = useQuery({
    queryKey: ["complaints", panchayatId, statusFilter, categoryFilter],
    queryFn: () =>
      complaintsService.getComplaints(panchayatId, {
        status: statusFilter !== "all" ? (statusFilter as ComplaintStatus) : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
      }),
  });

  // Fetch single complaint details if selected
  const { data: detailResponse, isLoading: isDetailLoading } = useQuery({
    queryKey: ["complaint-detail", selectedId],
    queryFn: () => complaintsService.getComplaintDetail(selectedId!),
    enabled: !!selectedId,
  });

  // Mutation to update complaint status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, remark }: { id: number; status: ComplaintStatus; remark: string }) =>
      complaintsService.updateStatus(id, status, remark),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaint-detail", selectedId] });
      alert("Complaint status updated successfully!");
    },
    onError: (err: any) => {
      alert("Error: " + err.message);
    },
  });

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    updateStatusMutation.mutate({
      id: selectedId,
      status: statusInput,
      remark: remarkInput,
    });
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    const styles = {
      open: "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
      in_progress: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
      resolved: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
      rejected: "bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    };
    return (
      <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${styles[status]}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  const list = response?.data ?? [];
  const filteredList = list.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.reference_no.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term) ||
      (c.citizen_name && c.citizen_name.toLowerCase().includes(term))
    );
  });

  const selectedComplaint = detailResponse?.data;

  return (
    <Page title="Citizen Complaints">
      <div className="transition-content w-full px-(--margin-x) pt-5 pb-8 lg:pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-dark-50">Citizen Complaints</h1>
          <p className="text-sm text-gray-500 dark:text-dark-300">
            Review, assign, and resolve public complaints filed by citizens in your Gram Panchayat.
          </p>
        </div>

        {/* Toolbar & Filters */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <MagnifyingGlassIcon className="size-5" />
              </span>
              <input
                type="text"
                placeholder="Search by ref no, citizen name, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FunnelIcon className="size-4" />
                <span>Filter By:</span>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
              >
                <option value="all">All Categories</option>
                <option value="road">Roads & Potholes</option>
                <option value="water">Water Supply</option>
                <option value="streetlight">Street Light</option>
                <option value="garbage">Garbage Cleanliness</option>
                <option value="drainage">Drainage leakage</option>
                <option value="tree">Tree Plantation</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </Card>

        {/* List & Detail layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Complaints List Table */}
          <div className={`${selectedId ? "lg:col-span-7" : "lg:col-span-12"}`}>
            <Card className="overflow-hidden">
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Spinner className="size-8 text-emerald-600" />
                </div>
              ) : filteredList.length === 0 ? (
                <div className="py-12 text-center text-gray-500 dark:text-dark-300">
                  No complaints found matching current filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-dark-800 dark:bg-dark-800/50">
                        <th className="p-4">Reference No</th>
                        <th className="p-4">Citizen</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Panchayat</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Date</th>
                        <th className="p-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-dark-800">
                      {filteredList.map((complaint) => (
                        <tr
                          key={complaint.id}
                          onClick={() => {
                            setSelectedId(complaint.id);
                            setRemarkInput(complaint.remark || "");
                            setStatusInput(complaint.status);
                          }}
                          className={`hover:bg-gray-50/70 dark:hover:bg-dark-800/40 cursor-pointer transition-colors ${
                            selectedId === complaint.id ? "bg-emerald-50/30 dark:bg-emerald-950/10" : ""
                          }`}
                        >
                          <td className="p-4 font-bold text-gray-800 dark:text-dark-50">{complaint.reference_no}</td>
                          <td className="p-4">
                            <div>
                              <div className="font-semibold text-gray-800 dark:text-dark-100">{complaint.citizen_name}</div>
                              <div className="text-xs text-gray-400">{complaint.citizen_mobile}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 uppercase dark:bg-emerald-950/20 dark:text-emerald-400">
                              {complaint.category}
                            </span>
                          </td>
                          <td className="p-4 text-xs font-medium text-gray-500 dark:text-dark-300">
                            {complaint.panchayat_name}
                          </td>
                          <td className="p-4">{getStatusBadge(complaint.status)}</td>
                          <td className="p-4 text-xs text-gray-400">
                            {new Date(complaint.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            <ChevronRightIcon className="size-4 text-gray-400" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Details Drawer */}
          {selectedId && (
            <div className="lg:col-span-5">
              <Card className="sticky top-6 p-5 border border-gray-100 shadow-md">
                <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-dark-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-dark-50">Complaint Details</h3>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="text-gray-400 hover:text-gray-600 dark:text-dark-300 dark:hover:text-dark-100"
                  >
                    Close &times;
                  </button>
                </div>

                {isDetailLoading || !selectedComplaint ? (
                  <div className="flex h-64 items-center justify-center">
                    <Spinner className="size-6 text-emerald-600" />
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Reference & Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-800 dark:text-dark-50">
                        {selectedComplaint.reference_no}
                      </span>
                      {getStatusBadge(selectedComplaint.status)}
                    </div>

                    {/* Citizen Details */}
                    <div className="rounded-lg bg-gray-50 p-3.5 space-y-2 dark:bg-dark-800/40">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Filer Information</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-dark-100">
                        <UserIcon className="size-4 text-gray-400" />
                        <span className="font-semibold">{selectedComplaint.citizen_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-dark-100">
                        <PhoneIcon className="size-4 text-gray-400" />
                        <span>{selectedComplaint.citizen_mobile}</span>
                      </div>
                      {selectedComplaint.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-dark-100">
                          <MapPinIcon className="size-4 text-gray-400" />
                          <span>{selectedComplaint.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Description</h4>
                      <p className="text-sm text-gray-700 dark:text-dark-100 leading-relaxed">
                        {selectedComplaint.description}
                      </p>
                    </div>

                    {/* Photo Viewer */}
                    {selectedComplaint.photo_url && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Attached Photo</h4>
                        <div
                          onClick={() => setLightboxUrl(selectedComplaint.photo_url!)}
                          className="group relative cursor-pointer overflow-hidden rounded-lg border border-gray-100 dark:border-dark-800"
                        >
                          <img
                            src={selectedComplaint.photo_url}
                            alt="Complaint Attachment"
                            className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold">
                            Click to expand
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action form */}
                    <form onSubmit={handleUpdateStatus} className="border-t border-gray-100 pt-4 space-y-4 dark:border-dark-800">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-dark-100">Update Resolution Status</h4>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-500">Status</label>
                          <select
                            value={statusInput}
                            onChange={(e) => setStatusInput(e.target.value as ComplaintStatus)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-500">Resolution Remark / Comment</label>
                        <textarea
                          rows={3}
                          value={remarkInput}
                          onChange={(e) => setRemarkInput(e.target.value)}
                          placeholder="Provide audit notes or reasons for closure..."
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                        ></textarea>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                        disabled={updateStatusMutation.isPending}
                      >
                        {updateStatusMutation.isPending ? "Saving..." : "Save Status Changes"}
                      </Button>
                    </form>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* Lightbox Modal */}
        {lightboxUrl && (
          <div
            onClick={() => setLightboxUrl(null)}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 p-4 animate-fade-in"
          >
            <div className="relative max-w-4xl">
              <img src={lightboxUrl} alt="High Res Attachment" className="max-h-[85vh] max-w-full rounded-lg shadow-2xl" />
              <button
                onClick={() => setLightboxUrl(null)}
                className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 focus:outline-none"
              >
                &times; Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}
