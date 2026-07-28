import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white px-8 py-6 shadow-sm">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-gray-700">Loading...</p>
      </div>
    </div>
  );
}
