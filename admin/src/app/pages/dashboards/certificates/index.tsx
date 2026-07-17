import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowTopRightOnSquareIcon,
  IdentificationIcon,
  DocumentArrowUpIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Page } from "@/components/shared/Page";
import { Card, Button, Spinner } from "@/components/ui";
import { useAuthContext } from "@/app/contexts/auth/context";
import { certificatesService } from "@/services/certificates.service";
import { Certificate, CertificateStatus } from "@/services/types";

export default function Certificates() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const panchayatId = user?.panchayat_id ?? 0; // 0 = Super Admin (all)

  // Filter tabs: "all", "pending", "under_review", "approved", "rejected", "ready"
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  // Update form inputs
  const [statusInput, setStatusInput] = useState<CertificateStatus>("pending");
  const [remarkInput, setRemarkInput] = useState<string>("");
  const [pdfUrlInput, setPdfUrlInput] = useState<string>("");

  // Fetch certificates list
  const { data: response, isLoading } = useQuery({
    queryKey: ["certificates", panchayatId, activeTab],
    queryFn: () =>
      certificatesService.getCertificates(panchayatId, {
        status: activeTab !== "all" ? (activeTab as CertificateStatus) : undefined,
      }),
  });

  // Fetch detail
  const { data: detailResponse, isLoading: isDetailLoading } = useQuery({
    queryKey: ["certificate-detail", selectedId],
    queryFn: () => certificatesService.getCertificateDetail(selectedId!),
    enabled: !!selectedId,
  });

  // Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      remark,
      pdfUrl,
    }: {
      id: number;
      status: CertificateStatus;
      remark: string;
      pdfUrl?: string;
    }) => certificatesService.updateStatus(id, status, remark, pdfUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      queryClient.invalidateQueries({ queryKey: ["certificate-detail", selectedId] });
      alert("Certificate status updated!");
    },
    onError: (err: any) => {
      alert("Error: " + err.message);
    },
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    
    if (statusInput === "ready" && !pdfUrlInput.trim()) {
      alert("PDF URL is required when status is marked 'Ready'.");
      return;
    }

    updateStatusMutation.mutate({
      id: selectedId,
      status: statusInput,
      remark: remarkInput,
      pdfUrl: statusInput === "ready" ? pdfUrlInput : undefined,
    });
  };

  const getStatusBadge = (status: CertificateStatus) => {
    const styles = {
      pending: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
      under_review: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
      approved: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
      rejected: "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
      ready: "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30",
    };
    return (
      <span className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${styles[status]}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  const renderDetails = (cert: Certificate) => {
    const d = cert.details;
    switch (cert.type) {
      case "birth":
        return (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="block text-xs text-gray-400 font-medium">Child Name</span>
              <span className="font-semibold text-gray-800 dark:text-dark-100">{d.child_name || "N/A"}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 font-medium">Gender</span>
              <span className="font-semibold text-gray-800 dark:text-dark-100 capitalize">{d.gender || "N/A"}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 font-medium">Date of Birth</span>
              <span className="font-semibold text-gray-800 dark:text-dark-100">{d.dob || "N/A"}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 font-medium">Place of Birth</span>
              <span className="font-semibold text-gray-800 dark:text-dark-100">{d.pob || "N/A"}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-xs text-gray-400 font-medium">Father's Name</span>
              <span className="font-semibold text-gray-800 dark:text-dark-100">{d.father_name || "N/A"}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-xs text-gray-400 font-medium">Mother's Name</span>
              <span className="font-semibold text-gray-800 dark:text-dark-100">{d.mother_name || "N/A"}</span>
            </div>
          </div>
        );
      case "income":
        return (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="block text-xs text-gray-400 font-medium">Annual Income</span>
              <span className="font-bold text-gray-800 dark:text-dark-100">{d.annual_income || "N/A"}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 font-medium">Financial Year</span>
              <span className="font-semibold text-gray-800 dark:text-dark-100">{d.financial_year || "N/A"}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-xs text-gray-400 font-medium">Purpose of Certificate</span>
              <span className="font-semibold text-gray-800 dark:text-dark-100">{d.purpose || "N/A"}</span>
            </div>
          </div>
        );
      case "residence":
        return (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="block text-xs text-gray-400 font-medium">Stay Duration</span>
              <span className="font-semibold text-gray-800 dark:text-dark-100">{d.stay_duration || "N/A"}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 font-medium">Ration Card Number</span>
              <span className="font-semibold text-gray-800 dark:text-dark-100">{d.ration_card_no || "N/A"}</span>
            </div>
          </div>
        );
      case "death":
        return (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="col-span-2">
              <span className="block text-xs text-gray-400 font-medium">Deceased Person</span>
              <span className="font-semibold text-gray-800 dark:text-dark-100">{d.deceased_name || "N/A"}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 font-medium">Age at Death</span>
              <span className="font-semibold text-gray-800 dark:text-dark-100">{d.age || "N/A"} years</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 font-medium">Date of Death</span>
              <span className="font-semibold text-gray-800 dark:text-dark-100">{d.dod || "N/A"}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-xs text-gray-400 font-medium">Place of Death</span>
              <span className="font-semibold text-gray-800 dark:text-dark-100">{d.pod || "N/A"}</span>
            </div>
          </div>
        );
      default:
        return <pre className="text-xs">{JSON.stringify(d, null, 2)}</pre>;
    }
  };

  const list = response?.data ?? [];
  const selectedCert = detailResponse?.data;

  const tabs = [
    { key: "all", label: "All Applications" },
    { key: "pending", label: "Pending" },
    { key: "under_review", label: "Under Review" },
    { key: "approved", label: "Approved" },
    { key: "ready", label: "Ready / Issued" },
  ];

  return (
    <Page title="Certificate Requests">
      <div className="transition-content w-full px-(--margin-x) pt-5 pb-8 lg:pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-dark-50">Certificate Requests</h1>
          <p className="text-sm text-gray-500 dark:text-dark-300">
            Verify documentation and issue Birth, Death, Income, and Residence certificates to local villagers.
          </p>
        </div>

        {/* Status Tab Navigation */}
        <div className="mb-5 border-b border-gray-100 dark:border-dark-800 flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSelectedId(null);
              }}
              className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.key
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-gray-500 hover:text-gray-800 dark:text-dark-300 dark:hover:text-dark-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid split list & detail */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Certificates Table */}
          <div className={`${selectedId ? "lg:col-span-7" : "lg:col-span-12"}`}>
            <Card className="overflow-hidden">
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Spinner className="size-8 text-emerald-600" />
                </div>
              ) : list.length === 0 ? (
                <div className="py-12 text-center text-gray-500 dark:text-dark-300">
                  No certificate requests found under this status tab.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-dark-800 dark:bg-dark-800/50">
                        <th className="p-4">Reference No</th>
                        <th className="p-4">Applicant Name</th>
                        <th className="p-4">Certificate Type</th>
                        <th className="p-4">Panchayat</th>
                        <th className="p-4">Status</th>
                        <th className="p-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-dark-800">
                      {list.map((cert) => (
                        <tr
                          key={cert.id}
                          onClick={() => {
                            setSelectedId(cert.id);
                            setStatusInput(cert.status);
                            setRemarkInput(cert.remark || "");
                            setPdfUrlInput(cert.pdf_url || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
                          }}
                          className={`hover:bg-gray-50/70 dark:hover:bg-dark-800/40 cursor-pointer transition-colors ${
                            selectedId === cert.id ? "bg-emerald-50/30 dark:bg-emerald-950/10" : ""
                          }`}
                        >
                          <td className="p-4 font-bold text-gray-800 dark:text-dark-50">{cert.reference_no}</td>
                          <td className="p-4 font-semibold text-gray-800 dark:text-dark-100">{cert.applicant_name}</td>
                          <td className="p-4">
                            <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800 uppercase dark:bg-emerald-950/20 dark:text-emerald-400">
                              {cert.type}
                            </span>
                          </td>
                          <td className="p-4 text-xs font-medium text-gray-500 dark:text-dark-300">
                            {cert.panchayat_name}
                          </td>
                          <td className="p-4">{getStatusBadge(cert.status)}</td>
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

          {/* Details & Actions Panel */}
          {selectedId && (
            <div className="lg:col-span-5">
              <Card className="sticky top-6 p-5 border border-gray-100 shadow-md">
                <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-dark-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-dark-50">Application Details</h3>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="text-gray-400 hover:text-gray-600 dark:text-dark-300 dark:hover:text-dark-100"
                  >
                    Close &times;
                  </button>
                </div>

                {isDetailLoading || !selectedCert ? (
                  <div className="flex h-64 items-center justify-center">
                    <Spinner className="size-6 text-emerald-600" />
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Pipeline Info */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-800 dark:text-dark-50">{selectedCert.reference_no}</span>
                      {getStatusBadge(selectedCert.status)}
                    </div>

                    {/* Meta information */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Submitted by: <b>{selectedCert.citizen_name}</b></span>
                      <span>•</span>
                      <span>Date: <b>{new Date(selectedCert.created_at).toLocaleDateString()}</b></span>
                    </div>

                    {/* Render Form JSON details */}
                    <div className="border-y border-gray-100 py-4 dark:border-dark-800">
                      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Application Form Data</h4>
                      {renderDetails(selectedCert)}
                    </div>

                    {/* PDF URL display if ready */}
                    {selectedCert.pdf_url && (
                      <div className="flex items-center justify-between rounded-lg bg-purple-50 p-3 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400">
                        <div className="flex items-center gap-2 text-sm">
                          <IdentificationIcon className="size-5" />
                          <span className="font-semibold text-xs">Generated Certificate PDF File</span>
                        </div>
                        <a
                          href={selectedCert.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs font-bold underline hover:text-purple-950 dark:hover:text-purple-200"
                        >
                          View PDF <ArrowTopRightOnSquareIcon className="size-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Resolution form pipeline */}
                    <form onSubmit={handleUpdate} className="space-y-4">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-dark-100">Review Application Pipeline</h4>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-500">Workflow State</label>
                          <select
                            value={statusInput}
                            onChange={(e) => setStatusInput(e.target.value as CertificateStatus)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                          >
                            <option value="pending">Pending</option>
                            <option value="under_review">Under Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="ready">Ready (Issue PDF)</option>
                          </select>
                        </div>
                      </div>

                      {/* PDF URL Input (Required only when status ready is selected) */}
                      {statusInput === "ready" && (
                        <div className="animate-fade-in space-y-1">
                          <label className="block text-xs font-semibold text-purple-700 dark:text-purple-400">
                            Upload / Attach Certificate PDF Link <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-600">
                              <DocumentArrowUpIcon className="size-5" />
                            </span>
                            <input
                              type="url"
                              required
                              value={pdfUrlInput}
                              onChange={(e) => setPdfUrlInput(e.target.value)}
                              placeholder="https://example.com/certificates/res-1.pdf"
                              className="w-full rounded-lg border border-purple-200 py-2 pl-10 pr-4 text-sm focus:border-purple-500 focus:outline-none dark:border-purple-700/60 dark:bg-dark-800 text-purple-900 dark:text-purple-100"
                            />
                          </div>
                          <p className="text-xs text-gray-400">Attach a hosted link to the generated document.</p>
                        </div>
                      )}

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-500">Review Notes / Remarks</label>
                        <textarea
                          rows={3}
                          value={remarkInput}
                          onChange={(e) => setRemarkInput(e.target.value)}
                          placeholder="Provide auditing logs, deficiencies, or approval remarks..."
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                        ></textarea>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                        disabled={updateStatusMutation.isPending}
                      >
                        {updateStatusMutation.isPending ? "Processing..." : "Update Application Status"}
                      </Button>
                    </form>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
