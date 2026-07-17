import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MegaphoneIcon,
  TrashIcon,
  PlusIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Page } from "@/components/shared/Page";
import { Card, Button, Spinner } from "@/components/ui";
import { useAuthContext } from "@/app/contexts/auth/context";
import { noticesService } from "@/services/notices.service";
import { NoticeType } from "@/services/types";

export default function Notices() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const panchayatId = user?.panchayat_id ?? 1; // Default to panchayat 1 if super admin (since notices require a panchayat_id to post)

  // Modals / forms state
  const [showAddForm, setShowAddForm] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [bodyInput, setBodyInput] = useState("");
  const [typeInput, setTypeInput] = useState<NoticeType>("general");

  // Fetch notices
  const { data: response, isLoading } = useQuery({
    queryKey: ["notices", user?.panchayat_id],
    queryFn: () =>
      noticesService.getNotices({
        panchayat_id: user?.panchayat_id ?? undefined, // Super admin sees all, GP Admin sees scoped
      }),
  });

  // Create notice mutation
  const createNoticeMutation = useMutation({
    mutationFn: (data: { panchayat_id: number; title: string; body: string; type: NoticeType }) =>
      noticesService.createNotice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      setShowAddForm(false);
      setTitleInput("");
      setBodyInput("");
      setTypeInput("general");
      alert("Notice posted successfully!");
    },
    onError: (err: any) => {
      alert("Error: " + err.message);
    },
  });

  // Delete notice mutation
  const deleteNoticeMutation = useMutation({
    mutationFn: (id: number) => noticesService.deleteNotice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      alert("Notice deleted successfully!");
    },
    onError: (err: any) => {
      alert("Error: " + err.message);
    },
  });

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim() || !bodyInput.trim()) {
      alert("Title and Body are required.");
      return;
    }
    createNoticeMutation.mutate({
      panchayat_id: panchayatId,
      title: titleInput,
      body: bodyInput,
      type: typeInput,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this notice? This action is permanent.")) {
      deleteNoticeMutation.mutate(id);
    }
  };

  const getNoticeTheme = (type: NoticeType) => {
    switch (type) {
      case "emergency":
        return {
          border: "border-l-4 border-l-red-500",
          icon: <ExclamationTriangleIcon className="size-6 text-red-500" />,
          bg: "bg-red-50/50 dark:bg-red-950/10",
          badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        };
      case "water":
        return {
          border: "border-l-4 border-l-sky-500",
          icon: <InformationCircleIcon className="size-6 text-sky-500" />,
          bg: "bg-sky-50/30 dark:bg-sky-950/10",
          badge: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400",
        };
      case "meeting":
        return {
          border: "border-l-4 border-l-blue-500",
          icon: <CalendarDaysIcon className="size-6 text-blue-500" />,
          bg: "bg-blue-50/30 dark:bg-blue-950/10",
          badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        };
      case "scheme":
        return {
          border: "border-l-4 border-l-amber-500",
          icon: <LightBulbIcon className="size-6 text-amber-500" />,
          bg: "bg-amber-50/30 dark:bg-amber-950/10",
          badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        };
      default:
        return {
          border: "border-l-4 border-l-gray-400",
          icon: <MegaphoneIcon className="size-6 text-gray-500" />,
          bg: "bg-gray-50/30 dark:bg-dark-800/40",
          badge: "bg-gray-100 text-gray-800 dark:bg-dark-700 dark:text-gray-300",
        };
    }
  };

  const list = response?.data ?? [];

  return (
    <Page title="Gram Panchayat Notice Board">
      <div className="transition-content w-full px-(--margin-x) pt-5 pb-8 lg:pt-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-dark-50">Notice Board</h1>
            <p className="text-sm text-gray-500 dark:text-dark-300">
              Broadcast critical announcements, emergency updates, schemes announcements, and meeting notices to citizens.
            </p>
          </div>

          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium self-start sm:self-auto"
          >
            <PlusIcon className="size-5" /> Post New Announcement
          </Button>
        </div>

        {/* Modal Posting Form */}
        {showAddForm && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
            <Card className="w-full max-w-lg p-6 shadow-2xl relative">
              <button
                onClick={() => setShowAddForm(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
              
              <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-dark-50">Post New Notice</h3>
              
              <form onSubmit={handlePost} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Notice Category / Type</label>
                  <select
                    value={typeInput}
                    onChange={(e) => setTypeInput(e.target.value as NoticeType)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                  >
                    <option value="general">General Announcement</option>
                    <option value="emergency">Emergency Alert</option>
                    <option value="meeting">Gram Sabha / Committee Meeting</option>
                    <option value="scheme">Welfare Scheme Notice</option>
                    <option value="water">Water Supply / Sanitation Update</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Notice Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter heading..."
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Notice Message (Body)</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Write detailed announcements description here..."
                    value={bodyInput}
                    onChange={(e) => setBodyInput(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800"
                  ></textarea>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => setShowAddForm(false)}
                    className="h-10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    disabled={createNoticeMutation.isPending}
                  >
                    {createNoticeMutation.isPending ? "Posting..." : "Broadcast Notice"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Notices Board List */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner className="size-10 text-emerald-600" />
          </div>
        ) : list.length === 0 ? (
          <div className="py-16 text-center text-gray-500 dark:text-dark-300">
            No notices are currently posted. Use the button above to broadcast a notice.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((notice) => {
              const theme = getNoticeTheme(notice.type);
              return (
                <Card
                  key={notice.id}
                  className={`flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${theme.border} ${theme.bg}`}
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="mb-3 flex items-center justify-between">
                      <span className={`rounded-md px-2 py-0.5 text-2xs font-bold uppercase tracking-wider ${theme.badge}`}>
                        {notice.type}
                      </span>
                      
                      <div className="flex items-center gap-1 text-2xs text-gray-400 font-semibold">
                        <ClockIcon className="size-3.5" />
                        {new Date(notice.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex gap-3">
                      <div className="shrink-0">{theme.icon}</div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-dark-50 leading-tight">
                          {notice.title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-dark-250 leading-relaxed whitespace-pre-line">
                          {notice.body}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between bg-gray-50/50 dark:border-dark-800 dark:bg-dark-800/10">
                    <span className="text-2xs font-medium text-gray-400">
                      Posted by: {notice.panchayat_name}
                    </span>

                    <button
                      onClick={() => handleDelete(notice.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                      title="Delete notice"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Page>
  );
}
