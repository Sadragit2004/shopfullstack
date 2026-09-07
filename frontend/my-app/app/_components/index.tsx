"use client";

import React, { useState } from "react";
import { ThemeProvider } from "./ThemeProvider";
import Header from "./Header";
import MobileDrawer from "./MobileDrawer";
import HeroBanner from "./HeroBanner";
import CategoriesSection from "./CategoriesSection";
import FamousBrandsSection from "./FamousBrandsSection"; // ✅ اضافه شد
import AmazingDealsSection from "./AmazingDealsSection";
import BestSellersSection from "./BestSellersSection";
import NewestSection from "./NewestSection";
import TodayShipmentsSection from "./TodayShipmentsSection";
import BlogSection from "./BlogSection";
import Newsletter from "./Newsletter";
import Footer from "./Footer";

export default function HomeContainer() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <ThemeProvider>
      <div
        className="min-h-screen bg-white text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-100"
        dir="rtl"
      >
        <Header onMenuClick={() => setDrawerOpen(true)} />
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

        <main>
          <HeroBanner />
          <CategoriesSection />

          {/* ✅ بخش برندهای معروف اضافه شد */}
          <FamousBrandsSection />

          <AmazingDealsSection />
          <BestSellersSection />
          <NewestSection />
          <TodayShipmentsSection />
          <BlogSection />
          <Newsletter />
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}