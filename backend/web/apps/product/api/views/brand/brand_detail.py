# apps/product/api/views/brand/brand_detail.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator
from apps.product.models.brand import Brand
from apps.product.api.serializers.brand.brand_product import (
    BrandDetailSerializer,
    BrandProductListSerializer,
    BrandCategoryListSerializer,
    BrandWithProductsFilterSerializer,
)
from apps.product.models.category import Category
from apps.core.api.response import success_response
from django.db import models

class BrandDetailView(APIView):
    """
    دریافت جزئیات برند با محصولات مرتبط و فیلتر دسته‌بندی

    پارامترهای URL:
    - brand_slug: اسلاگ برند

    پارامترهای Query:
    - category: اسلاگ دسته‌بندی (اختیاری)
    - page: شماره صفحه (پیش‌فرض: 1)
    - page_size: تعداد آیتم در صفحه (پیش‌فرض: 20)
    """

    def get(self, request, brand_slug, *args, **kwargs):
        # ============================================================
        # 1. دریافت برند
        # ============================================================
        brand = get_object_or_404(
            Brand.objects.filter(is_active=True),
            slug=brand_slug
        )

        # ============================================================
        # 2. دریافت پارامترهای Query
        # ============================================================
        category_slug = request.query_params.get('category')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))

        # محدود کردن page_size
        if page_size > 100:
            page_size = 100

        # ============================================================
        # 3. کوئری پایه محصولات
        # ============================================================
        products_queryset = brand.products.filter(
            status='published'
        ).select_related('brand').prefetch_related('categories', 'sales')

        # ============================================================
        # 4. اعمال فیلتر دسته‌بندی
        # ============================================================
        if category_slug:
            products_queryset = products_queryset.filter(
                categories__slug=category_slug,
                categories__status='published'
            )

        # ============================================================
        # 5. دریافت دسته‌بندی‌های مرتبط با برند
        # ============================================================
        categories = (
            Category.objects
            .filter(
                products__brand=brand,
                products__status='published',
                status='published'
            )
            .annotate(
                product_count=models.Count('products')
            )
            .filter(
                product_count__gt=0
            )
            .order_by('-product_count', 'title')
        )

        # ============================================================
        # 6. صفحه‌بندی محصولات
        # ============================================================
        paginator = Paginator(products_queryset, page_size)
        page_obj = paginator.get_page(page)

        # ============================================================
        # 7. سریالایزرها
        # ============================================================
        # سریالایزر برند
        brand_serializer = BrandDetailSerializer(
            brand,
            context={'request': request}
        )

        # سریالایزر محصولات
        products_serializer = BrandProductListSerializer(
            page_obj,
            many=True,
            context={'request': request}
        )

        # سریالایزر دسته‌بندی‌ها
        categories_serializer = BrandCategoryListSerializer(
            categories,
            many=True,
            context={'request': request}
        )

        # ============================================================
        # 8. پاسخ نهایی
        # ============================================================
        response_data = {
            'brand': brand_serializer.data,
            'categories': categories_serializer.data,
            'products': products_serializer.data,
            'pagination': {
                'total_count': paginator.count,
                'page': page,
                'page_size': page_size,
                'total_pages': paginator.num_pages,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
            },
            'total_products': paginator.count,
        }

        return Response(
            success_response(data=response_data),
            status=status.HTTP_200_OK
        )