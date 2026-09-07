"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "./icons";
import { HERO_SLIDES } from "./data";

export default function HeroBanner() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((i) => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  const go = (i: number) => setActive((i + HERO_SLIDES.length) % HERO_SLIDES.length);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-4 sm:pt-6 md:px-6">
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="relative h-[320px] overflow-hidden rounded-3xl sm:h-[360px] md:h-[420px]"
      >
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            aria-hidden={i !== active}
            className={`absolute inset-0 bg-gradient-to-bl ${slide.from} ${slide.to} transition-opacity duration-700 ease-in-out ${
              i === active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
            <slide.icon className="pointer-events-none absolute -left-6 bottom-0 h-40 w-40 text-white/[0.07] sm:h-56 sm:w-56" />

            <div className="relative flex h-full flex-col items-start justify-center gap-3 px-6 sm:gap-4 sm:px-12 md:px-16">
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm">
                <slide.icon className="h-3.5 w-3.5" />
                {slide.badge}
              </span>
              <h1 className="max-w-md text-[26px] font-extrabold leading-tight text-white sm:max-w-lg sm:text-[34px] md:text-[42px]">
                {slide.title}
              </h1>
              <p className="max-w-[280px] text-[13.5px] leading-relaxed text-white/80 sm:max-w-sm sm:text-[15px]">
                {slide.subtitle}
              </p>
              <Link
                href={slide.href}
                className="mt-1 flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[14px] font-bold text-stone-900 shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5 sm:mt-2"
              >
                {slide.cta}
                <Icon.ArrowMore className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        ))}

        <button
          onClick={() => go(active - 1)}
          aria-label="اسلاید قبلی"
          className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:flex"
        >
          <Icon.ChevronBack className="h-4 w-4 rotate-180" />
        </button>
        <button
          onClick={() => go(active + 1)}
          aria-label="اسلاید بعدی"
          className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:flex"
        >
          <Icon.ChevronBack className="h-4 w-4" />
        </button>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => go(i)}
              aria-label={`رفتن به اسلاید ${(i + 1).toLocaleString("fa-IR")}`}
              className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"}`}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {[
          { icon: Icon.Shield, title: "ضمانت اصالت کالا" },
          { icon: Icon.Truck, title: "ارسال سریع" },
          { icon: Icon.Return, title: "بازگشت ۷ روزه" },
          { icon: Icon.Headset, title: "پشتیبانی ۲۴ ساعته" },
        ].map((it) => (
          <div
            key={it.title}
            className="flex items-center gap-2.5 rounded-xl border border-stone-100 bg-white px-3 py-2.5 dark:border-stone-800 dark:bg-stone-900"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700/10 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
              <it.icon className="h-4 w-4" />
            </span>
            <p className="truncate text-[12.5px] font-medium text-stone-700 dark:text-stone-200">{it.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}