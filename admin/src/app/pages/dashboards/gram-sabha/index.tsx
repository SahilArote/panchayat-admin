import { useQuery } from "@tanstack/react-query";
import {
  CalendarDaysIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Page } from "@/components/shared/Page";
import { Card, Spinner } from "@/components/ui";
import { useAuthContext } from "@/app/contexts/auth/context";
import meetingsMock from "@/mocks/gramSabha.mock.json";

export default function GramSabha() {
  const { user } = useAuthContext();
  const panchayatId = user?.panchayat_id ?? 0;

  // Fetch Gram Sabha meetings (fully mock)
  const { data: response, isLoading } = useQuery({
    queryKey: ["gram-sabha-meetings", panchayatId],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 400));
      let list = [...meetingsMock];
      if (panchayatId > 0) {
        list = list.filter((m) => m.panchayat_id === panchayatId);
      }
      return { success: true, data: list };
    },
  });

  const list = response?.data ?? [];

  return (
    <Page title="Gram Sabha Meetings">
      <div className="transition-content w-full px-(--margin-x) pt-5 pb-8 lg:pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50">Gram Sabha Meetings</h1>
          <p className="text-sm text-gray-500 dark:text-dark-300">
            Audit resolutions, schedule general body meetings, and track villager participation stats in local assembly.
          </p>
        </div>

        {/* List of meetings */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner className="size-10 text-emerald-600" />
          </div>
        ) : list.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-dark-300">
            No Gram Sabha meetings indexed.
          </div>
        ) : (
          <div className="space-y-6">
            {list.map((meeting) => (
              <Card key={meeting.id} className="p-5 flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-gray-100 pb-4 dark:border-dark-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-2xs font-bold uppercase tracking-wider ${
                        meeting.status === "completed" 
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400" 
                          : "bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400"
                      }`}>
                        {meeting.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-dark-300 font-semibold">{meeting.panchayat_name}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-dark-50 leading-snug">{meeting.title}</h3>
                  </div>

                  <div className="flex flex-col items-start gap-1 sm:items-end text-xs text-gray-400 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <CalendarDaysIcon className="size-4.5" />
                      <span>{new Date(meeting.date).toLocaleString()}</span>
                    </div>
                    {meeting.status === "completed" && (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <UserGroupIcon className="size-4.5" />
                        <span>{meeting.attendees} Villagers Attended</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Meeting Agenda</h4>
                    <p className="text-sm text-gray-600 dark:text-dark-250 leading-relaxed">{meeting.agenda}</p>
                  </div>

                  {meeting.status === "completed" && meeting.resolutions && (
                    <div className="space-y-1.5 bg-emerald-50/20 p-3 rounded-lg border border-emerald-500/10 dark:bg-emerald-950/5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <ClipboardDocumentCheckIcon className="size-4" /> Passed Resolutions
                      </h4>
                      <p className="text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed whitespace-pre-line font-medium">
                        {meeting.resolutions}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
