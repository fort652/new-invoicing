import Link from "next/link";

export default function AccessRevokedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Access revoked
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Your account no longer has access to this app. Contact support if you need access.
        </p>
        <Link
          href="/sign-in"
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-white hover:bg-blue-700"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
