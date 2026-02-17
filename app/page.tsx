import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h1 className="mb-6 text-6xl font-bold text-gray-900 dark:text-white">
          Invoice Management
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          Create, manage, and track your invoices with real-time updates powered by Convex
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/sign-in"
            className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg border-2 border-blue-600 px-8 py-3 text-lg font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
          >
            Sign Up
          </Link>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-md">
            <h3 className="mb-2 text-xl font-semibold">Real-time Updates</h3>
            <p className="text-gray-600">
              See changes instantly across all devices with Convex sync engine
            </p>
          </div>
          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-md">
            <h3 className="mb-2 text-xl font-semibold">Client Management</h3>
            <p className="text-gray-600">
              Keep track of all your clients and their information in one place
            </p>
          </div>
          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-md">
            <h3 className="mb-2 text-xl font-semibold">Invoice Tracking</h3>
            <p className="text-gray-600">
              Monitor invoice status from draft to paid with detailed analytics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
