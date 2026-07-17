import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PlusIcon,
  UserPlusIcon,
  MapPinIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Page } from "@/components/shared/Page";
import { Card, Button, Spinner } from "@/components/ui";
import { panchayatsService } from "@/services/panchayats.service";
import { adminUsersService } from "@/services/adminUsers.service";
import { Panchayat } from "@/services/types";

export default function Panchayats() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPanchayat, setSelectedPanchayat] = useState<Panchayat | null>(null);

  // Form states
  const [nameInput, setNameInput] = useState("");
  const [talukaInput, setTalukaInput] = useState("");
  const [districtInput, setDistrictInput] = useState("");
  const [populationInput, setPopulationInput] = useState(5000);
  const [wardsInput, setWardsInput] = useState(5);
  const [logoInput, setLogoInput] = useState("");
  
  // Assign admin states
  const [selectedAdminId, setSelectedAdminId] = useState<number>(0);

  // Query panchayats list
  const { data: response, isLoading } = useQuery({
    queryKey: ["panchayats"],
    queryFn: () => panchayatsService.getPanchayats(),
  });

  // Query admins list for assignment dropdown
  const { data: adminsResponse } = useQuery({
    queryKey: ["admin-users-list"],
    queryFn: () => adminUsersService.getAdminUsers(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Omit<Panchayat, "id">) => panchayatsService.createPanchayat(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["panchayats"] });
      setShowAddModal(false);
      resetForm();
      alert("Gram Panchayat added successfully!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => panchayatsService.deletePanchayat(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["panchayats"] });
      alert("Gram Panchayat deleted successfully!");
    },
  });

  const assignAdminMutation = useMutation({
    mutationFn: ({ panchayatId, adminId }: { panchayatId: number; adminId: number }) =>
      panchayatsService.assignAdmin(panchayatId, adminId),
    onSuccess: () => {
      setShowAssignModal(false);
      alert("GP Admin assigned successfully to Gram Panchayat!");
    },
  });

  const resetForm = () => {
    setNameInput("");
    setTalukaInput("");
    setDistrictInput("");
    setPopulationInput(5000);
    setWardsInput(5);
    setLogoInput("");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    createMutation.mutate({
      name: nameInput,
      taluka: talukaInput,
      district: districtInput,
      population: populationInput,
      ward_count: wardsInput,
      logo_url: logoInput || "https://images.unsplash.com/photo-1544731612-de7f96afe55f?q=80&w=200&auto=format&fit=crop",
    });
  };

  const handleAssignAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPanchayat || !selectedAdminId) return;
    assignAdminMutation.mutate({
      panchayatId: selectedPanchayat.id,
      adminId: selectedAdminId,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this Gram Panchayat? This will wipe citizen links.")) {
      deleteMutation.mutate(id);
    }
  };

  const list = response?.data ?? [];
  const filteredList = list.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.district && p.district.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const availableAdmins = adminsResponse?.data?.filter((a) => a.role === "gp_admin") ?? [];

  return (
    <Page title="Gram Panchayat Manager">
      <div className="transition-content w-full px-(--margin-x) pt-5 pb-8 lg:pt-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50">Gram Panchayat Manager</h1>
            <p className="text-sm text-gray-500 dark:text-dark-300">
              Super Admin Control: Create new Gram Panchayats, track statistics, and allocate GP admin accounts.
            </p>
          </div>

          <Button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium self-start sm:self-auto"
          >
            <PlusIcon className="size-5" /> Add Gram Panchayat
          </Button>
        </div>

        {/* Search tool */}
        <Card className="mb-6 p-4">
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <PlusIcon className="size-5 rotate-45" /> {/* Just magnifying visual replacement */}
            </span>
            <input
              type="text"
              placeholder="Search by panchayat name, district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
            />
          </div>
        </Card>

        {/* Listing */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner className="size-8 text-emerald-600" />
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-dark-300">
              No Gram Panchayats found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-dark-800 dark:bg-dark-800/50">
                    <th className="p-4">Logo</th>
                    <th className="p-4">Panchayat Name</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Population</th>
                    <th className="p-4">Wards Count</th>
                    <th className="p-4">Registered Citizens</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-800">
                  {filteredList.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-800/20">
                      <td className="p-4">
                        <img
                          src={p.logo_url}
                          alt="Logo"
                          className="size-10 rounded-full border border-gray-100 object-cover dark:border-dark-800"
                        />
                      </td>
                      <td className="p-4 font-bold text-gray-800 dark:text-dark-50">{p.name}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-dark-300">
                          <MapPinIcon className="size-3.5 text-gray-400" />
                          <span>{p.taluka}, {p.district} ({p.state})</span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-gray-800 dark:text-dark-100">{p.population?.toLocaleString()}</td>
                      <td className="p-4 text-xs font-semibold text-gray-500 dark:text-dark-300">{p.ward_count} Wards</td>
                      <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                        {p.citizen_count} Citizens
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => {
                              setSelectedPanchayat(p);
                              setSelectedAdminId(availableAdmins[0]?.id || 0);
                              setShowAssignModal(true);
                            }}
                            className="h-8 gap-1.5 bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 text-xs px-2.5"
                            variant="outlined"
                          >
                            <UserPlusIcon className="size-4" /> Assign Admin
                          </Button>
                          
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                            title="Delete Panchayat"
                          >
                            <TrashIcon className="size-4.5" />
                          </button>
                        </div>
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
            <Card className="w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>

              <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-dark-50">Create New Gram Panchayat</h3>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Panchayat Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nerle Gram Panchayat"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Taluka</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Walwa"
                      value={talukaInput}
                      onChange={(e) => setTalukaInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">District</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sangli"
                      value={districtInput}
                      onChange={(e) => setDistrictInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Population</label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={populationInput}
                      onChange={(e) => setPopulationInput(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Wards Count</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={wardsInput}
                      onChange={(e) => setWardsInput(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Logo Image Link (URL)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/logo.jpg"
                    value={logoInput}
                    onChange={(e) => setLogoInput(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button type="button" variant="outlined" onClick={() => setShowAddModal(false)} className="h-10">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creating..." : "Create Panchayat"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Assign Admin Modal */}
        {showAssignModal && selectedPanchayat && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
            <Card className="w-full max-w-sm p-6 shadow-2xl relative">
              <button
                onClick={() => setShowAssignModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>

              <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-dark-50">Assign GP Admin</h3>
              <p className="mb-4 text-xs text-gray-400">
                Delegate management of <b>{selectedPanchayat.name}</b> to an administrative user.
              </p>

              <form onSubmit={handleAssignAdmin} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Select GP Admin</label>
                  {availableAdmins.length === 0 ? (
                    <p className="text-sm text-red-500 font-semibold">No available GP Admin accounts found. Create one first under "Admin Users" tab.</p>
                  ) : (
                    <select
                      value={selectedAdminId}
                      onChange={(e) => setSelectedAdminId(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                    >
                      {availableAdmins.map((admin) => (
                        <option key={admin.id} value={admin.id}>
                          {admin.name} ({admin.mobile})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button type="button" variant="outlined" onClick={() => setShowAssignModal(false)} className="h-10">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    disabled={availableAdmins.length === 0 || assignAdminMutation.isPending}
                  >
                    {assignAdminMutation.isPending ? "Assigning..." : "Confirm Assignment"}
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
