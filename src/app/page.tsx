export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-6 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-10 shadow-md">
        <h1 className="text-2xl font-semibold text-slate-900">Career Reflection</h1>
        <p className="mt-3 text-sm text-slate-600">
          Enter the correct URL to start your exercise.
        </p>
        <div className="mt-6 rounded-2xl border bg-slate-50 p-5 text-sm text-slate-700">
          <div className="font-semibold text-slate-900">Available exercises</div>
          <ul className="mt-2 list-disc pl-5">
            <li>
              <span className="font-semibold">Acquisitions Career Reflection:</span> <span className="font-mono">/acquisitions</span>
            </li>
            <li>
              <span className="font-semibold">Asset Management Career Reflection:</span>{" "}
              <span className="font-mono">/asset-management</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
