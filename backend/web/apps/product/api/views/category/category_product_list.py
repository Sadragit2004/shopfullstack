# apps/product/api/views/category_product_list.py
from rest_framework.generics import GenericAPIView
from django.db.models import Q, Count, Min, Max, F
from rest_framework.response import Response
from rest_framework import status
from django.core.paginator import Paginator
from apps.product.api.serializers.category.public.product_category_filter import (
    ProductFilterSerializer,
    ProductListWithFilterResponseSerializer,
    ProductFilterOptionSerializer,
)
from apps.product.models.manager.category.product_filter import ProductFilterService
from apps.product.models.category import Category
from apps.core.api.response import success_response
from django.shortcuts import get_object_or_404


class CategoryProductListView(GenericAPIView):
    """
    دریافت محصولات بر اساس اسلاگ دسته‌بندی با فیلترینگ پیشرفته

    پارامترهای URL:
    - category_slug: اسلاگ دسته‌بندی

    پارامترهای Query:
    - page: شماره صفحه (پیش‌فرض: 1)
    - page_size: تعداد آیتم در صفحه (پیش‌فرض: 20)
    - min_price: حداقل قیمت
    - max_price: حداکثر قیمت
    - brands[]: لیست اسلاگ برندها
    - feature_[key]: مقدار ویژگی (مثلاً feature_color=red)
    - has_inventory: true/false (فقط محصولات با موجودی)
    - search: جستجوی متن در عنوان و توضیحات
    - ordering: مرتب‌سازی (newest, oldest, price_asc, price_desc, popular)
    """

    def get(self, request, category_slug, *args, **kwargs):
        # بررسی وجود دسته‌بندی
        category = get_object_or_404(
            Category.objects.filter(status='published'),
            slug=category_slug
        )

        # ایجاد سرویس فیلتر
        filter_service = ProductFilterService(category_slug, request)

        # اعمال فیلترها
        queryset = filter_service.apply_filters()

        # جستجو
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )

        # مرتب‌سازی
        ordering = request.query_params.get('ordering', 'newest')
        if ordering == 'newest':
            queryset = queryset.order_by('-created_at')
        elif ordering == 'oldest':
            queryset = queryset.order_by('created_at')
        elif ordering == 'price_asc':
            queryset = queryset.order_by('sales__selling_price')
        elif ordering == 'price_desc':
            queryset = queryset.order_by('-sales__selling_price')
        elif ordering == 'popular':
            queryset = queryset.annotate(
                sale_count=Count('sales__product_sale')
            ).order_by('-sale_count')
        else:
            queryset = queryset.order_by('-created_at')

        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))

        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)

        # سریالایزر محصولات
        products_serializer = ProductFilterSerializer(
            page_obj,
            many=True,
            context={'request': request}
        )

        # دریافت گزینه‌های فیلتر (فقط برای صفحه اول یا درخواست خاص)
        include_filters = request.query_params.get('include_filters', 'true').lower() == 'true'
        filters_data = filter_service.get_filter_options() if include_filters else None

        # پاسخ نهایی
        response_data = {
            'products': products_serializer.data,
            'filters': filters_data,
            'pagination': {
                'total_count': paginator.count,
                'page': page,
                'page_size': page_size,
                'total_pages': paginator.num_pages,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
            },
            'category': {
                'id': category.id,
                'title': category.title,
                'slug': category.slug,
                'description': category.description,
            }
        }

        return Response(
            success_response(data=response_data),
            status=status.HTTP_200_OK
        )