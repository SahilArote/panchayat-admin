import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Page } from "@/components/shared/Page";
import { Card, Button, Spinner } from "@/components/ui";
import { adminUsersService } from "@/services/adminUsers.service";
import { panchayatsService } from "@/services/panchayats.service";
import { AdminUser } from "@/services/types";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [panchayatId, setPanchayatId] = useState<number>(0);

  // Fetch admin accounts
  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminUsersService.getAdminUsers({ search: searchTerm }),
  });

  // Fetch panchayats list for dropdown
  const { data: panchayatsResponse } = useQuery({
    queryKey: ["panchayats-list"],
    queryFn: () => panchayatsService.getPanchayats(),
  });

  // Create admin user mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<AdminUser, "id">) => adminUsersService.createAdminUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setShowAddModal(false);
      resetForm();
      alert("GP Admin account created successfully!");
    },
  });

  // Delete admin mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminUsersService.deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      alert("Admin user account deleted successfully!");
    },
  });

  const resetForm = () => {
    setName("");
    setMobile("");
    setPanchayatId(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) return;

    const selectedPanch = panchayatsList.find((p) => p.id === panchayatId);
    
    createMutation.mutate({
      name,
      mobile,
      role: "gp_admin",
      panchayat_id: panchayatId || null,
      panchayat_name: selectedPanch ? selectedPanch.name : null,
    });
  };

  const handleDelete = (id: number) => {
    if (id === 999) {
      alert("Cannot delete the root Super Administrator account!");
      return;
    }
    if (confirm("Are you sure you want to delete this administrative account?")) {
      deleteMutation.mutate(id);
    }
  };

  const list = response?.data ?? [];
  const panchayatsList = panchayatsResponse?.data ?? [];

  return (
    <Page title="Admin Accounts Panel">
      <div className="transition-content w-full px-(--margin-x) pt-5 pb-8 lg:pt-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50">GP Admin Accounts</h1>
            <p className="text-sm text-gray-500 dark:text-dark-300">
              Super Admin Control: Provision and audit accounts for Gram Panchayat administrators.
            </p>
          </div>

          <Button
            onClick={() => {
              resetForm();
              if (panchayatsList.length > 0) {
                setPanchayatId(panchayatsList[0].id);
              }
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium self-start sm:self-auto"
          >
            <PlusIcon className="size-5" /> Provision GP Admin
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6 p-4">
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <PlusIcon className="size-5 rotate-45" />
            </span>
            <input
              type="text"
              placeholder="Search by admin name, mobile, panchayat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
            />
          </div>
        </Card>

        {/* Table list */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner className="size-8 text-emerald-600" />
            </div>
          ) : list.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-dark-300">
              No admin accounts found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-dark-800 dark:bg-dark-800/50">
                    <th className="p-4">Staff Name</th>
                    <th className="p-4">Admin Role</th>
                    <th className="p-4">Mobile Username</th>
                    <th className="p-4">Assigned Gram Panchayat</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-800">
                  {list.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-800/20">
                      <td className="p-4 font-bold text-gray-800 dark:text-dark-50">{admin.name}</td>
                      <td className="p-4">
                        {admin.role === "super_admin" ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-red-100 bg-red-50 px-2 py-0.5 text-2xs font-bold text-red-800 uppercase dark:border-red-950/20 dark:bg-red-950/20 dark:text-red-400">
                            Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md border border-amber-100 bg-amber-50 px-2 py-0.5 text-2xs font-bold text-amber-800 uppercase dark:border-amber-950/20 dark:bg-amber-950/20 dark:text-amber-400">
                            GP Admin
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-gray-600 dark:text-dark-300">{admin.mobile}</td>
                      <td className="p-4 text-xs font-semibold text-gray-500 dark:text-dark-200">
                        {admin.panchayat_name || "Global Scope"}
                      </td>
                      <td className="p-4 text-xs text-gray-400">
                        {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="p-4">
                        {admin.id !== 999 && (
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                            title="Delete Admin Account"
                          >
                            <TrashIcon className="size-4.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
            <Card className="w-full max-w-sm p-6 shadow-2xl relative">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>

              <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-dark-50">Provision GP Admin</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Admin Staff Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Balaji Rao Deshmukh"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Mobile Number (username)</label>
                  <input
                    type="tel"
                    required
                    pattern="^[6-9]\d{9}$"
                    placeholder="Enter 10-digit number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Assign Gram Panchayat</label>
                  {panchayatsList.length === 0 ? (
                    <p className="text-sm text-red-500 font-semibold">No Gram Panchayats found. Create one first.</p>
                  ) : (
                    <select
                      value={panchayatId}
                      onChange={(e) => setPanchayatId(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                    >
                      {panchayatsList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button type="button" variant="outlined" onClick={() => setShowAddModal(false)} className="h-10">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    disabled={panchayatsList.length === 0 || createMutation.isPending}
                  >
                    {createMutation.isPending ? "Provisioning..." : "Confirm Account"}
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
