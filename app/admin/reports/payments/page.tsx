'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaDownload, FaSearch } from 'react-icons/fa';

interface Payment {
  _id: string;
  transactionId: string;
  amount: number;
  phoneNumber: string;
  category: string;
  campaignName?: string;
  fullName?: string;
  email?: string;
  status: string;
  mpesaReceiptNumber?: string;
  createdAt: string;
}

interface Summary {
  totalCount: number;
  totalAmount: number;
  categorySummary: {
    [key: string]: {
      count: number;
      amount: number;
    }
  }
}

export default function PaymentReportsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    if (status === "authenticated") {
      // Check if user is admin
      if (session?.user?.role !== "admin") {
        router.push("/admin/dashboard");
        return;
      }

      // Set default date range to this month
      if (!startDate && !endDate) {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        setStartDate(firstDayOfMonth.toISOString().split("T")[0]);
        setEndDate(now.toISOString().split("T")[0]);
      } else {
        fetchPaymentReport();
      }
    }
  }, [status, router, session, startDate, endDate]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchPaymentReport();
    }
  }, [startDate, endDate, category]);

  const fetchPaymentReport = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (category !== "all") queryParams.append("category", category);

      const response = await fetch(
        `/api/admin/reports/payments?${queryParams.toString()}`
      );
      const data = await response.json();

      if (data.success) {
        setPayments(data.data.payments);
        setSummary(data.data.summary);
      } else {
        setError("Failed to fetch payment report");
      }
    } catch (err) {
      setError("An error occurred while fetching payment report");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    // Convert data to CSV
    const headers = [
      "Transaction ID",
      "Receipt Number",
      "Amount",
      "Category",
      "Campaign",
      "Name",
      "Phone",
      "Email",
      "Date",
    ];
    const csvRows = [
      headers.join(","),
      ...payments.map((payment) =>
        [
          payment.transactionId,
          payment.mpesaReceiptNumber || "N/A",
          payment.amount,
          payment.category,
          payment.campaignName || "N/A",
          payment.fullName || "Anonymous",
          payment.phoneNumber,
          payment.email || "N/A",
          new Date(payment.createdAt).toLocaleString(),
        ].join(",")
      ),
    ];

    // Create file and download
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `payments-report-${startDate}-${endDate}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payment Reports</h1>
        {payments.length > 0 && (
          <button
            onClick={downloadReport}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <FaDownload className="mr-2" /> Download CSV
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Filter Options</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="all">All Categories</option>
              <option value="tithe">Tithe</option>
              <option value="offering">Offering</option>
              <option value="campaign">Campaign</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={fetchPaymentReport}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <FaSearch className="mr-2" /> Generate Report
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 p-4 rounded mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Summary Section */}
      {summary && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Summary</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Total Transactions</h3>
              <p className="text-3xl font-bold">{summary.totalCount}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Total Amount</h3>
              <p className="text-3xl font-bold">
                {formatAmount(summary.totalAmount)}
              </p>
            </div>

            {/* Category breakdowns */}
            <div className="bg-yellow-50 p-4 rounded-lg md:col-span-2">
              <h3 className="text-lg font-semibold mb-2">Category Breakdown</h3>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(summary.categorySummary).map(([cat, data]) => (
                  <div key={cat} className="text-center">
                    <p className="font-medium capitalize">{cat}</p>
                    <p className="text-lg font-bold">
                      {formatAmount(data.amount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {data.count} transactions
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-bold p-6 border-b">Transaction Details</h2>

        {loading ? (
          <div className="p-4 text-center">Loading payment data...</div>
        ) : payments.length === 0 ? (
          <div className="p-4 text-center">
            <p>No payments found for the selected criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Transaction ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Donor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.transactionId}
                      </div>
                      <div className="text-xs text-gray-500">
                        {payment.mpesaReceiptNumber || "No receipt"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatAmount(payment.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {payment.fullName || "Anonymous"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {payment.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {payment.category}
                      </div>
                      {payment.campaignName && (
                        <div className="text-xs text-gray-500">
                          {payment.campaignName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}