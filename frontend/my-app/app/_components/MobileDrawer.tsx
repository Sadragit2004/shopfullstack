"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "./icons";
import { CATEGORIES, NAV_LINKS, CATEGORY_ICON_MAP } from "./data";
import { useTheme } from "./ThemeProvider";

function MobileCategoryNode({ node, depth = 0 }: { node: typeof CATEGORIES[0]; depth?: number }) {
  const [open, setOpen] = useState(false);
  const hasChildren = !!node.children?.length;

  return (
    <div className={depth > 0 ? "border-s border-stone-100 ps-3 dark:border-stone-800" : ""}>
      <div className="flex items-center">
        <Link
          href={node.href}
          className="flex flex-1 items-center gap-2.5 py-2.5 text-[14.5px] text-stone-700 dark:text-stone-200"
        >
          {depth === 0 && node.icon && CATEGORY_ICON_MAP[node.icon] && (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-700/10 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
              {React.createElement(CATEGORY_ICON_MAP[node.icon], { className: "h-4 w-4" })}
            </span>
          )}
          {node.title}
        </Link>
        {hasChildren && (
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "بستن زیرشاخه‌ها" : "نمایش زیرشاخه‌ها"}
            className="flex h-9 w-9 shrink-0 items-center justify-center text-stone-400"
          >
            <Icon.ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>
      {hasChildren && open && (
        <div className="mb-1 flex flex-col">
          {node.children!.map((child) => (
            <MobileCategoryNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme, toggle } = useTheme();

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-sm transition-opacity md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-[70] flex w-[85%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 md:hidden dark:bg-stone-900 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-4 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white dark:bg-teal-600">
              <Icon.Shield className="h-[18px] w-[18px]" />
            </span>
            <span className="font-bold text-stone-900 dark:text-white">آرامیس</span>
          </div>
          <button
            onClick={onClose}
            aria-label="بستن منو"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <Icon.X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="mb-3 flex flex-col gap-0.5 border-b border-stone-100 pb-3 dark:border-stone-800">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg px-2 py-2.5 text-[15px] font-medium text-stone-700 dark:text-stone-200">
                {l.title}
              </Link>
            ))}
          </div>

          <p className="mb-1 px-2 text-xs text-stone-400 dark:text-stone-500">همه‌ی دسته‌بندی‌ها</p>
          <div className="flex flex-col px-2">
            {CATEGORIES.map((cat) => (
              <MobileCategoryNode key={cat.id} node={cat} />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-stone-100 px-4 py-3.5 dark:border-stone-800">
          <span className="text-sm text-stone-500 dark:text-stone-400">حالت نمایش</span>
          <button
            onClick={toggle}
            className="flex items-center gap-2 rounded-full border border-stone-200 px-3 py-1.5 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-300"
          >
            {theme === "light" ? (
              <>
                <Icon.Sun className="h-4 w-4" /> روشن
              </>
            ) : (
              <>
                <Icon.Moon className="h-4 w-4" /> تیره
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}