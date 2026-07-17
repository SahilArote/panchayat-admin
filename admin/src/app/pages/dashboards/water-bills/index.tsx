import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Page } from "@/components/shared/Page";
import { Card, Button, Spinner } from "@/components/ui";
import { useAuthContext } from "@/app/contexts/auth/context";
import { waterBillsService } from "@/services/waterBills.service";

export default function WaterBills() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const panchayatId = user?.panchayat_id ?? 0;

  // Filter state
  const [filterType, setFilterType] = useState<string>("all");

  // Generate modal form state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [monthInput, setMonthInput] = useState(new Date().getMonth() + 1);
  const [yearInput, setYearInput] = useState(new Date().getFullYear());
  const [amountInput, setAmountInput] = useState(150);

  // Fetch water bills
  const { data: response, isLoading } = useQuery({
    queryKey: ["water-bills", panchayatId, filterType],
    queryFn: () =>
      waterBillsService.getWaterBills(panchayatId, {
        paid: filterType === "paid" ? true : filterType === "unpaid" ? false : undefined,
      }),
  });

  // Generate bills mutation
  const generateMutation = useMutation({
    mutationFn: (data: { panchayatId: number; month: number; year: number; amount: number }) =>
      waterBillsService.generateBills(data.panchayatId, data.month, data.year, data.amount),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["water-bills"] });
      setShowGenerateModal(false);
      alert(res.message || "Water bills generated successfully!");
    },
    onError: (err: any) => {
      alert("Error: " + err.message);
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!panchayatId) {
      alert("Super Admin cannot generate bills directly. Please log in as a GP Admin.");
      return;
    }
    generateMutation.mutate({
      panchayatId,
      month: monthInput,
      year: yearInput,
      amount: amountInput,
    });
  };

  const getMonthName = (monthNum: number) => {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString("en-US", { month: "long" });
  };

  const list = response?.data ?? [];

  return (
    <Page title="Water Tax Billing">
      <div className="transition-content w-full px-(--margin-x) pt-5 pb-8 lg:pt-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-dark-50">Water Tax & Billing</h1>
            <p className="text-sm text-gray-500 dark:text-dark-300">
              Monitor water tax collections, track defaults, and generate monthly water bills in bulk for registered houses.
            </p>
          </div>

          {user?.role === "gp_admin" && (
            <Button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium self-start sm:self-auto"
            >
              <PlusIcon className="size-5" /> Generate Monthly Bills
            </Button>
          )}
        </div>

        {/* Toolbar Filter */}
        <Card className="mb-6 p-4 flex gap-2 border-b border-gray-100 dark:border-dark-800">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === "all"
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-800 dark:text-dark-300"
            }`}
          >
            All Bills
          </button>
          <button
            onClick={() => setFilterType("unpaid")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === "unpaid"
                ? "bg-amber-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-800 dark:text-dark-300"
            }`}
          >
            Pending Dues
          </button>
          <button
            onClick={() => setFilterType("paid")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === "paid"
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-800 dark:text-dark-300"
            }`}
          >
            Collected Tax
          </button>
        </Card>

        {/* Bulk Generate Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
            <Card className="w-full max-w-md p-6 shadow-2xl relative">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>

              <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-dark-50">Generate Water Bills</h3>
              <p className="mb-4 text-xs text-gray-500">
                This will automatically generate unpaid water bills of flat pricing for ALL registered citizen households in {user?.panchayat_name}.
              </p>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Billing Month</label>
                    <select
                      value={monthInput}
                      onChange={(e) => setMonthInput(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {getMonthName(m)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Billing Year</label>
                    <select
                      value={yearInput}
                      onChange={(e) => setYearInput(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                    >
                      <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                      <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Flat Rate Amount (INR)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₹</span>
                    <input
                      type="number"
                      required
                      min={1}
                      value={amountInput}
                      onChange={(e) => setAmountInput(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-200 py-2 pl-7 pr-4 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button type="button" variant="outlined" onClick={() => setShowGenerateModal(false)} className="h-10">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    disabled={generateMutation.isPending}
                  >
                    {generateMutation.isPending ? "Generating..." : "Generate Bills"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Dues List Table */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner className="size-8 text-emerald-600" />
            </div>
          ) : list.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-dark-300">
              No bills found matching current filter state.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-dark-800 dark:bg-dark-800/50">
                    <th className="p-4">Billing Period</th>
                    <th className="p-4">Citizen Account</th>
                    <th className="p-4">Panchayat Name</th>
                    <th className="p-4">Tax Amount</th>
                    <th className="p-4">Billing Status</th>
                    <th className="p-4">Payment Receipt No</th>
                    <th className="p-4">Payment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-800">
                  {list.map((bill) => (
                    <tr key={bill.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-800/25">
                      <td className="p-4 font-bold text-gray-800 dark:text-dark-50">
                        <div className="flex items-center gap-1.5">
                          <CalendarDaysIcon className="size-4.5 text-gray-400" />
                          <span>{getMonthName(bill.month)} {bill.year}</span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-gray-800 dark:text-dark-100">{bill.citizen_name || `Citizen ID #${bill.citizen_id}`}</td>
                      <td className="p-4 text-xs font-medium text-gray-500 dark:text-dark-300">{bill.panchayat_name}</td>
                      <td className="p-4 font-bold text-gray-800 dark:text-dark-50">₹{Number(bill.amount).toFixed(2)}</td>
                      <td className="p-4">
                        {bill.paid ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 uppercase dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400">
                            <CheckCircleIcon className="size-3.5" /> Collected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md border border-amber-100 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 uppercase dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400">
                            <ClockIcon className="size-3.5" /> Pending Dues
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-gray-500 dark:text-dark-300 text-xs">
                        {bill.receipt_no || "-"}
                      </td>
                      <td className="p-4 text-xs text-gray-400">
                        {bill.payment_date ? new Date(bill.payment_date).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Page>
  );
}
