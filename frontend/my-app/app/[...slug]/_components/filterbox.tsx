// app/[locale]/categories/[...slug]/_components/filterbox.tsx
'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FilterOptions, ProductFilterParams } from '@/lib/api/categories/productFilter';

interface FilterBoxProps {
  filters: FilterOptions;
  currentParams: ProductFilterParams;
}

export default function FilterBox({ filters, currentParams }: FilterBoxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [priceMin, setPriceMin] = useState(currentParams.min_price || '');
  const [priceMax, setPriceMax] = useState(currentParams.max_price || '');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(currentParams.brands || []);
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, string[]>>({});
  const [hasInventory, setHasInventory] = useState(currentParams.has_inventory || false);
  const [isOpen, setIsOpen] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (priceMin) params.set('min_price', String(priceMin));
    else params.delete('min_price');

    if (priceMax) params.set('max_price', String(priceMax));
    else params.delete('max_price');

    params.delete('brands[]');
    selectedBrands.forEach(brand => params.append('brands[]', brand));

    Object.keys(selectedFeatures).forEach(key => {
      const values = selectedFeatures[key];
      if (values && values.length > 0) {
        params.set(`feature_${key}`, values.join(','));
      } else {
        params.delete(`feature_${key}`);
      }
    });

    if (hasInventory) params.set('has_inventory', 'true');
    else params.delete('has_inventory');

    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('page_size', String(currentParams.page_size || 20));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleFeatureChange = (featureKey: string, value: string, checked: boolean) => {
    setSelectedFeatures(prev => {
      const current = prev[featureKey] || [];
      if (checked) {
        return { ...prev, [featureKey]: [...current, value] };
      } else {
        return { ...prev, [featureKey]: current.filter(v => v !== value) };
      }
    });
  };

  const handleBrandChange = (brandSlug: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands(prev => [...prev, brandSlug]);
    } else {
      setSelectedBrands(prev => prev.filter(b => b !== brandSlug));
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 border border-slate-200/70 dark:border-slate-800/60">
      <button
        className="lg:hidden w-full bg-blue-600 text-white py-2 rounded-lg mb-4 hover:bg-blue-700 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'بستن فیلترها' : 'نمایش فیلترها'}
      </button>

      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
        {/* محدوده قیمت */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-3 text-slate-800 dark:text-slate-200">محدوده قیمت</h3>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="از"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-1/2 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="تا"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-1/2 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {filters.price_range.min} - {filters.price_range.max} تومان
          </div>
        </div>

        {/* برندها */}
        {filters.brands.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3 text-slate-800 dark:text-slate-200">برندها</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filters.brands.map((brand) => (
                <label key={brand.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.slug)}
                    onChange={(e) => handleBrandChange(brand.slug, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-500"
                  />
                  <span>{brand.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ویژگی‌ها */}
        {filters.features.map((feature) => (
          <div key={feature.id} className="mb-6">
            <h3 className="font-bold text-lg mb-3 text-slate-800 dark:text-slate-200">{feature.name}</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {feature.values.map((value) => (
                <label key={value.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(selectedFeatures[feature.key] || []).includes(value.value)}
                    onChange={(e) => handleFeatureChange(feature.key, value.value, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-500"
                  />
                  <span>{value.value}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {/* موجودی */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hasInventory}
              onChange={(e) => setHasInventory(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-500"
            />
            <span>فقط محصولات موجود</span>
          </label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition active:scale-[0.98]"
          >
            اعمال فیلتر
          </button>
          <button
            onClick={clearFilters}
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-[0.98]"
          >
            پاک کردن
          </button>
        </div>
      </div>
    </div>
  );
}