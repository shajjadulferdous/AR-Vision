import Link from 'next/link';
import { Metadata } from 'next';


export const metadata: Metadata = {
  title: '404 - Page Not Found',
};

export default function NotFound() {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-white font-sans text-gray-800">
      {/* 404 Text */}
      <h1 className="text-9xl font-extrabold tracking-widest text-slate-900">
        404
      </h1>
      
      {/* Orange Badge */}
      <div className="absolute rotate-12 rounded bg-[#f97316] px-3 py-1 text-sm font-semibold tracking-wide text-white shadow-lg">
        Page Not Found
      </div>

      {/* Description */}
      <p className="mt-8 text-center text-lg font-medium text-gray-600 sm:text-xl">
        Oops! The page you are looking for doesn not exist.
      </p>

      {/* Action Button */}
      <div className="mt-10 mt-8">
        <Link
          href="/"
          className="group relative inline-block text-sm font-medium text-[#f97316] focus:outline-none focus:ring-4 focus:ring-[#f97316]/30 active:text-orange-600"
        >
          {/* Button Background Shadow Effect */}
          <span className="absolute inset-0 translate-x-1 translate-y-1 bg-[#f97316] transition-transform group-hover:translate-x-0 group-hover:translate-y-0"></span>
          
          {/* Button Foreground */}
          <span className="relative block border-2 border-current bg-white px-8 py-3 text-slate-900 font-bold uppercase tracking-wider transition-colors group-hover:bg-[#f97316] group-hover:text-white">
            Go Back Home
          </span>
        </Link>
      </div>
    </main>
  );
}