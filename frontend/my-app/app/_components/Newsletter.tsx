"use client";

export default function Newsletter() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-4 md:px-6">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-teal-800 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-right dark:bg-teal-900">
        <div>
          <h3 className="text-[17px] font-bold text-white">از تخفیف‌ها باخبر شو</h3>
          <p className="mt-1 text-[13.5px] text-teal-100/80">عضویت در خبرنامه، بدون هیچ مزاحمتی</p>
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="flex w-full max-w-sm gap-2 sm:w-auto">
          <input
            type="email"
            placeholder="ایمیل شما"
            className="w-full rounded-xl border-0 bg-white/95 px-4 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button className="shrink-0 rounded-xl bg-amber-500 px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-amber-600">
            عضویت
          </button>
        </form>
      </div>
    </section>
  );
}