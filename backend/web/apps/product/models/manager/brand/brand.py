# apps/product/models/manager/brand/brand.py
from django.db import models
from django.db.models import Count, Q


class BrandManager(models.Manager):
    """
    مدیریت کوئری‌های مدل Brand
    """

    def active_by_product_count(self):
        """
        دریافت برندهای فعال با تعداد محصولات
        مرتب‌سازی بر اساس تعداد محصولات (بیشترین اولویت)
        """
        return (
            self.get_queryset()
            .filter(
                is_active=True,
            )
            .annotate(
                content_count=Count(
                    "products",
                    distinct=True,
                ),
            )
            .order_by(
                "-content_count",
                "-created_at",
            )
        )

    def get_active_brands(self):
        """
        دریافت برندهای فعال مرتب شده بر اساس نام
        """
        return (
            self.get_queryset()
            .filter(
                is_active=True,
            )
            .order_by("name")
        )

    def get_brand_by_slug(self, slug):
        """
        دریافت برند با اسلاگ مشخص
        """
        return (
            self.get_queryset()
            .filter(
                slug=slug,
                is_active=True,
            )
            .first()
        )

    def get_brand_with_products(self, slug):
        """
        دریافت برند با محصولات مرتبط (پریفچ شده)
        """
        return (
            self.get_queryset()
            .filter(
                slug=slug,
                is_active=True,
            )
            .prefetch_related(
                "products",
                "products__categories",
                "products__sales",
            )
            .first()
        )

    def get_brands_with_product_count(self):
        """
        دریافت برندهای فعال که حداقل یک محصول دارند با تعداد محصولات
        """
        return (
            self.get_queryset()
            .filter(
                is_active=True,
            )
            .annotate(
                product_count=Count(
                    "products",
                    distinct=True,
                ),
            )
            .filter(
                product_count__gt=0,
            )
            .order_by(
                "-product_count",
                "name",
            )
        )

    def get_brands_by_category(self, category_slug):
        """
        دریافت برندهای مربوط به یک دسته‌بندی خاص با تعداد محصولات
        """
        return (
            self.get_queryset()
            .filter(
                is_active=True,
                products__categories__slug=category_slug,
                products__categories__status="published",
                products__status="published",
            )
            .annotate(
                product_count=Count(
                    "products",
                    distinct=True,
                ),
            )
            .filter(
                product_count__gt=0,
            )
            .order_by(
                "-product_count",
                "name",
            )
            .distinct()
        )

    def get_brands_with_active_products(self):
        """
        دریافت برندهایی که حداقل یک محصول منتشر شده دارند
        """
        return (
            self.get_queryset()
            .filter(
                is_active=True,
                products__status="published",
            )
            .annotate(
                product_count=Count(
                    "products",
                    distinct=True,
                ),
            )
            .filter(
                product_count__gt=0,
            )
            .order_by(
                "-product_count",
                "name",
            )
            .distinct()
        )

    def get_featured_brands(self, limit=6):
        """
        دریافت برندهای ویژه با بیشترین تعداد محصول
        """
        return (
            self.get_queryset()
            .filter(
                is_active=True,
            )
            .annotate(
                product_count=Count(
                    "products",
                    distinct=True,
                ),
            )
            .filter(
                product_count__gt=0,
            )
            .order_by(
                "-product_count",
                "-created_at",
            )[:limit]
        )

    def search_brands(self, query):
        """
        جستجوی برندها بر اساس نام یا توضیحات
        """
        return (
            self.get_queryset()
            .filter(
                is_active=True,
            )
            .filter(
                Q(name__icontains=query) |
                Q(description__icontains=query)
            )
            .annotate(
                product_count=Count(
                    "products",
                    distinct=True,
                ),
            )
            .order_by(
                "-product_count",
                "name",
            )
        )

    def get_popular_brands(self, limit=10):
        """
        دریافت محبوب‌ترین برندها بر اساس تعداد محصولات
        """
        return (
            self.get_queryset()
            .filter(
                is_active=True,
            )
            .annotate(
                product_count=Count(
                    "products",
                    distinct=True,
                ),
            )
            .filter(
                product_count__gt=0,
            )
            .order_by(
                "-product_count",
                "name",
            )[:limit]
        )

    def get_brand_with_products_paginated(self, slug, page=1, page_size=20):
        """
        دریافت برند با محصولات به صورت صفحه‌بندی شده
        """
        from django.core.paginator import Paginator

        brand = self.get_brand_by_slug(slug)
        if not brand:
            return None, None

        products = brand.products.filter(
            status='published'
        ).select_related('brand').prefetch_related('categories', 'sales')

        paginator = Paginator(products, page_size)
        page_obj = paginator.get_page(page)

        return brand, page_obj

    def get_brand_categories_with_count(self, slug):
        """
        دریافت دسته‌بندی‌های مرتبط با برند با تعداد محصولات هر کدام
        """
        from apps.product.models.category import Category

        brand = self.get_brand_by_slug(slug)
        if not brand:
            return []

        return (
            Category.objects
            .filter(
                products__brand=brand,
                products__status='published',
                status='published'
            )
            .annotate(
                product_count=Count('products')
            )
            .filter(
                product_count__gt=0
            )
            .order_by('-product_count', 'title')
        )

    def get_brand_products_by_category(self, slug, category_slug):
        """
        دریافت محصولات برند بر اساس دسته‌بندی خاص
        """
        brand = self.get_brand_by_slug(slug)
        if not brand:
            return None

        return brand.products.filter(
            categories__slug=category_slug,
            categories__status='published',
            status='published'
        ).select_related('brand').prefetch_related('categories', 'sales')

    def get_brand_summary(self, slug):
        """
        دریافت خلاصه اطلاعات برند
        """
        from apps.product.models.category import Category

        brand = self.get_brand_by_slug(slug)
        if not brand:
            return None

        product_count = brand.products.filter(status='published').count()
        category_count = (
            Category.objects
            .filter(
                products__brand=brand,
                products__status='published',
                status='published'
            )
            .distinct()
            .count()
        )

        return {
            'brand': brand,
            'product_count': product_count,
            'category_count': category_count,
        }