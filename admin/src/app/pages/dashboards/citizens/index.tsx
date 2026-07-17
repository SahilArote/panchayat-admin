import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Page } from "@/components/shared/Page";
import { Card, Button, Spinner } from "@/components/ui";
import { useAuthContext } from "@/app/contexts/auth/context";
import { citizensService } from "@/services/citizens.service";
import { Citizen } from "@/services/types";

export default function Citizens() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const panchayatId = user?.panchayat_id ?? 0;

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [age, setAge] = useState(30);
  const [address, setAddress] = useState("");

  // Fetch citizens
  const { data: response, isLoading } = useQuery({
    queryKey: ["citizens", panchayatId, searchTerm],
    queryFn: () => citizensService.getCitizens(panchayatId, { search: searchTerm }),
  });

  // Create citizen mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<Citizen, "id">) => citizensService.createCitizen(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citizens"] });
      setShowAddModal(false);
      resetForm();
      alert("Citizen profile cataloged successfully!");
    },
  });

  const resetForm = () => {
    setName("");
    setMobile("");
    setGender("male");
    setAge(30);
    setAddress("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) return;
    createMutation.mutate({
      panchayat_id: panchayatId || 1, // Default to Nerle if Super Admin cataloging
      name,
      mobile,
      gender,
      age,
      address,
      role: "citizen",
      panchayat_name: user?.panchayat_name || "Nerle Gram Panchayat",
    });
  };

  const list = response?.data ?? [];

  return (
    <Page title="Citizens Directory">
      <div className="transition-content w-full px-(--margin-x) pt-5 pb-8 lg:pt-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50">Citizens Directory</h1>
            <p className="text-sm text-gray-500 dark:text-dark-300">
              List profiles, contact numbers, and registered village house addresses under this Gram Panchayat.
            </p>
          </div>

          <Button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium self-start sm:self-auto"
          >
            <PlusIcon className="size-5" /> Add Citizen Record
          </Button>
        </div>

        {/* Toolbar search */}
        <Card className="mb-6 p-4">
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <MagnifyingGlassIcon className="size-5" />
            </span>
            <input
              type="text"
              placeholder="Search by name, mobile, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
            />
          </div>
        </Card>

        {/* Directory list table */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner className="size-8 text-emerald-600" />
            </div>
          ) : list.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-dark-300">
              No registered citizens found in this directory.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-dark-800 dark:bg-dark-800/50">
                    <th className="p-4">Name</th>
                    <th className="p-4">Mobile Number</th>
                    <th className="p-4">Gender</th>
                    <th className="p-4">Age</th>
                    <th className="p-4">Gram Panchayat</th>
                    <th className="p-4">Resident Address</th>
                    <th className="p-4">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-800">
                  {list.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-800/20">
                      <td className="p-4 font-bold text-gray-800 dark:text-dark-50">{c.name}</td>
                      <td className="p-4 font-semibold text-gray-600 dark:text-dark-300">{c.mobile}</td>
                      <td className="p-4 capitalize text-xs font-semibold">{c.gender}</td>
                      <td className="p-4 text-xs font-semibold">{c.age} years</td>
                      <td className="p-4 text-xs text-gray-500 dark:text-dark-300 font-semibold">{c.panchayat_name}</td>
                      <td className="p-4 text-xs leading-normal max-w-xs truncate text-gray-600 dark:text-dark-200">
                        {c.address}
                      </td>
                      <td className="p-4 text-xs text-gray-400">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : "Historical Data"}
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

              <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-dark-50">Catalog Citizen Record</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Shankar Patil"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Mobile (10-digit)</label>
                    <input
                      type="tel"
                      required
                      pattern="^[6-9]\d{9}$"
                      placeholder="9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Age</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={120}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as "male" | "female" | "other")}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Resident Address</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="House number, Ward area, landmark..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                  ></textarea>
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
                    {createMutation.isPending ? "Cataloging..." : "Add Citizen"}
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
