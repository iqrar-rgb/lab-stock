import Link from "next/link";
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow">
        <h1 className="text-2xl font-semibold mb-3">Lab Stock</h1>
        <p className="mb-6 text-sm text-neutral-600">Silakan login untuk melanjutkan.</p>
        <Link href="/login" className="px-4 py-2 rounded-xl bg-black text-white w-full inline-block text-center">
          Go to Login
        </Link>
      </div>
    </main>
  );
}
