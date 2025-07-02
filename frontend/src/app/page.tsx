import Image from "next/image";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold mb-4">Fatoorty</h1>
          <p className="text-xl text-gray-600 mb-8">Restaurant Management System</p>
        </div>

        <div className="w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4 text-center">Login Options</h2>
          <div className="space-y-4">
            <Link 
              href="/superadmin/login"
              className="block w-full px-4 py-3 bg-[#6D72CF] text-white text-center rounded hover:bg-[#5A5FB8] transition-colors"
            >
              Superadmin Login
            </Link>
            <Link 
              href="/restaurant/login"
              className="block w-full px-4 py-3 bg-green-600 text-white text-center rounded hover:bg-green-700 transition-colors"
            >
              Restaurant Owner Login
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
          <div className="p-6 bg-white rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold mb-2">Superadmin Features</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Manage restaurant owners</li>
              <li>• View system analytics</li>
              <li>• Handle verifications</li>
              <li>• Support ticket management</li>
            </ul>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold mb-2">Restaurant Owner Features</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Manage restaurants</li>
              <li>• Create QR codes for tables</li>
              <li>• Manage menus and staff</li>
              <li>• View orders and analytics</li>
            </ul>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Make sure your backend server is running on <code className="bg-gray-100 px-1 rounded">http://localhost:5000</code></p>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
