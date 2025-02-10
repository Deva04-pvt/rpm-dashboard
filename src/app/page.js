export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-6">
      <div className="max-w-lg p-8 bg-white shadow-lg rounded-xl text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">
          Remote Patient Monitoring System
        </h1>
        <p className="text-gray-600 mb-6">
          Monitor real-time health data securely and efficiently.
        </p>
        <div className="flex space-x-4">
          <a
            href="/signup"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Sign Up
          </a>
          <a
            href="/login"
            className="px-6 py-3 border border-gray-400 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
