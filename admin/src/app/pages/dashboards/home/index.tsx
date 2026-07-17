import { useQuery } from "@tanstack/react-query";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import {
  UsersIcon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Page } from "@/components/shared/Page";
import { Card, Spinner } from "@/components/ui";
import { useAuthContext } from "@/app/contexts/auth/context";
import { dashboardService } from "@/services/dashboard.service";

export default function Home() {
  const { user } = useAuthContext();
  const role = user?.role ?? "gp_admin";

  const { data: response, isLoading } = useQuery({
    queryKey: ["dashboard-stats", role],
    queryFn: () => dashboardService.getStats(role),
  });

  if (isLoading) {
    return (
      <Page title="Dashboard">
        <div className="flex h-[80vh] w-full items-center justify-center">
          <Spinner className="size-10 text-emerald-600" />
        </div>
      </Page>
    );
  }

  const stats = response?.data;
  if (!stats) {
    return (
      <Page title="Dashboard">
        <div className="p-6 text-center text-red-500">Failed to load statistics.</div>
      </Page>
    );
  }

  // Monthly revenue chart config
  const revenueCategories = stats.monthly_revenue.map((r) => r.month);
  const revenueData = stats.monthly_revenue.map((r) => r.amount);

  const revenueChartConfig: ApexOptions = {
    colors: ["#10b981"], // Emerald Green
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: revenueCategories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val) => `₹${val.toLocaleString()}`,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    grid: {
      borderColor: "#f1f5f9",
    },
  };

  const revenueSeries = [
    {
      name: "Revenue Collected",
      data: revenueData,
    },
  ];

  // Complaints by category chart config
  const complaintLabels = Object.keys(stats.complaints_by_category).map(
    (key) => key.charAt(0).toUpperCase() + key.slice(1)
  );
  const complaintValues = Object.values(stats.complaints_by_category);

  const complaintChartConfig: ApexOptions = {
    colors: ["#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280"], // Amber, Emerald, Red, Blue, Purple, Pink, Gray
    labels: complaintLabels,
    legend: {
      position: "bottom",
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(0)}%`,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
        },
      },
    },
  };

  return (
    <Page title="Smart Panchayat Dashboard">
      <div className="transition-content w-full px-(--margin-x) pt-5 pb-8 lg:pt-6">
        {/* Welcome Section */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-dark-50">
              Namaskar, {user?.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-dark-300">
              {role === "super_admin" 
                ? "Global Administration Overview (All Gram Panchayats)"
                : `GP Administration Panel for ${user?.panchayat_name}`}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider">Live CRM Database</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5 lg:gap-6">
          <Card className="flex items-center justify-between border-l-4 border-l-emerald-500 p-5 shadow-sm">
            <div>
              <p className="text-xs-plus font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">Registered Citizens</p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-dark-50">
                {stats.total_citizens.toLocaleString()}
              </h3>
            </div>
            <div className="rounded-full bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <UsersIcon className="size-6" />
            </div>
          </Card>

          <Card className="flex items-center justify-between border-l-4 border-l-amber-500 p-5 shadow-sm">
            <div>
              <p className="text-xs-plus font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">Total Complaints</p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-dark-50">
                {stats.total_complaints}
              </h3>
              <div className="mt-2 flex gap-3 text-xs font-semibold text-gray-500">
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircleIcon className="size-3.5" /> {stats.resolved_complaints} Resolved
                </span>
                <span className="flex items-center gap-1 text-amber-600">
                  <ClockIcon className="size-3.5" /> {stats.pending_complaints} Pending
                </span>
              </div>
            </div>
            <div className="rounded-full bg-amber-50 p-3 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
              <ChatBubbleLeftRightIcon className="size-6" />
            </div>
          </Card>

          <Card className="flex items-center justify-between border-l-4 border-l-blue-500 p-5 shadow-sm">
            <div>
              <p className="text-xs-plus font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">Active Notices</p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-dark-50">
                {stats.total_notices}
              </h3>
            </div>
            <div className="rounded-full bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
              <MegaphoneIcon className="size-6" />
            </div>
          </Card>

          <Card className="flex items-center justify-between border-l-4 border-l-purple-500 p-5 shadow-sm">
            <div>
              <p className="text-xs-plus font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">Water Tax Collected</p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-dark-50">
                ₹{stats.total_collected.toLocaleString()}
              </h3>
              <div className="mt-2 flex items-center gap-1 text-xs text-red-500 font-semibold">
                <ExclamationCircleIcon className="size-3.5" /> ₹{stats.total_due_bills.toLocaleString()} Outstanding
              </div>
            </div>
            <div className="rounded-full bg-purple-50 p-3 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400">
              <CurrencyRupeeIcon className="size-6" />
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="col-span-1 p-5 shadow-sm lg:col-span-2">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100">Tax Revenue Collection</h3>
              <p className="text-xs text-gray-400">Monthly breakdown of water tax payments received from citizens</p>
            </div>
            <div className="w-full">
              <Chart
                options={revenueChartConfig}
                series={revenueSeries}
                type="area"
                height={280}
              />
            </div>
          </Card>

          <Card className="p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100">Complaints by Category</h3>
              <p className="text-xs text-gray-400">Distribution of citizen reports logged in the system</p>
            </div>
            <div className="flex h-[280px] w-full items-center justify-center">
              <Chart
                options={complaintChartConfig}
                series={complaintValues}
                type="donut"
                width={320}
              />
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
