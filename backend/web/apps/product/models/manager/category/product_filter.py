# apps/product/services/product_filter.py
from django.db.models import Q, Count, Min, Max, F
from django.db.models import Prefetch
from apps.product.models.product import Product
from apps.product.models.feature import Feature
from apps.product.models.brand import Brand
from apps.product.models.category import Category
from apps.product.models.product_feature import ProductFeature
from apps.product.models.inventory import Inventory
from apps.product.models.product_sale import ProductSale


class ProductFilterService:
    """سرویس فیلترینگ پیشرفته محصولات"""

    def __init__(self, category_slug, request):
        self.category_slug = category_slug
        self.request = request
        self.queryset = self._get_base_queryset()
        self.filters = {}

    def _get_base_queryset(self):
        """گرفتن کوئری‌ست پایه با پریفچ‌های مورد نیاز"""
        return Product.objects.filter(
            categories__slug=self.category_slug,
            status='published'
        ).distinct().select_related(
            'brand'
        ).prefetch_related(
            Prefetch('categories', queryset=Category.objects.filter(status='published')),
            Prefetch(
                'sales',
                queryset=ProductSale.objects.filter(
                    is_active=True,
                    selling_price__gte=0
                ).select_related('unit', 'sale_type')
            ),
            Prefetch(
                'features',
                queryset=ProductFeature.objects.filter(
                    feature__is_active=True
                ).select_related('feature')
            ),
        )

    def apply_filters(self):
        """اعمال تمام فیلترها"""
        queryset = self.queryset

        # فیلتر قیمت
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')

        if min_price:
            queryset = queryset.filter(
                sales__selling_price__gte=min_price
            )
        if max_price:
            queryset = queryset.filter(
                sales__selling_price__lte=max_price
            )

        # فیلتر برند
        brands = self.request.query_params.getlist('brands[]')
        if brands:
            queryset = queryset.filter(
                brand__slug__in=brands
            )

        # فیلتر ویژگی‌ها - نسخه اصلاح شده
        feature_params = {}
        for key, value in self.request.query_params.items():
            if key.startswith('feature_'):
                feature_key = key.replace('feature_', '')
                if value:
                    feature_params[feature_key] = value

        for feature_key, value in feature_params.items():
            try:
                feature = Feature.objects.get(key=feature_key, is_active=True)
                values_list = value.split(',')

                if feature.type in ['select', 'multi_select']:
                    queryset = queryset.filter(
                        features__feature=feature,
                        features__feature_values__value__in=values_list
                    )
                elif feature.type in ['text', 'number']:
                    # اصلاح: استفاده از filter با Q objects به روش صحیح
                    if len(values_list) == 1:
                        queryset = queryset.filter(
                            features__feature=feature,
                            features__custom_value__icontains=values_list[0]
                        )
                    else:
                        # ساخت Q objects برای چند مقدار
                        q_objects = Q()
                        for val in values_list:
                            q_objects |= Q(features__custom_value__icontains=val)

                        queryset = queryset.filter(
                            features__feature=feature
                        ).filter(q_objects)
            except Feature.DoesNotExist:
                pass

        # فیلتر موجودی (فقط محصولاتی که موجودی دارند)
        has_inventory = self.request.query_params.get('has_inventory')
        if has_inventory and has_inventory.lower() == 'true':
            queryset = queryset.filter(
                sales__inventory__quantity__gt=0,
                sales__inventory__is_active=True
            )

        return queryset.distinct()

    def get_filter_options(self):
        """گرفتن گزینه‌های فیلتر"""
        # برندهای موجود در این دسته‌بندی
        brands = Brand.objects.filter(
            products__categories__slug=self.category_slug,
            products__status='published',
            is_active=True,
        ).distinct().values(
            'id', 'name', 'slug'
        ).order_by('name')

        # ویژگی‌های قابل فیلتر در این دسته‌بندی
        features = Feature.objects.filter(
            category_features__category__slug=self.category_slug,
            is_active=True,
            type__in=['select', 'multi_select']
        ).distinct().prefetch_related('values').order_by('sort_order', 'name')

        features_data = []
        for feature in features:
            values = feature.values.filter(
                is_active=True,
                product_features__product__categories__slug=self.category_slug,
                product_features__product__status='published'
            ).distinct().values('id', 'value').order_by('sort_order', 'value')

            if values.exists():
                features_data.append({
                    'id': feature.id,
                    'key': feature.key,
                    'name': feature.name,
                    'type': feature.type,
                    'values': list(values),
                })

        # محدوده قیمت
        price_aggregate = Product.objects.filter(
            categories__slug=self.category_slug,
            status='published',
            sales__is_active=True,
            sales__selling_price__gte=0
        ).aggregate(
            min_price=Min('sales__selling_price'),
            max_price=Max('sales__selling_price')
        )

        price_range = {
            'min': str(price_aggregate['min_price'] or 0),
            'max': str(price_aggregate['max_price'] or 0),
        }

        # دسته‌بندی‌های مرتبط
        categories = Category.objects.filter(
            products__categories__slug=self.category_slug,
            status='published'
        ).distinct().values('id', 'title', 'slug').order_by('title')

        return {
            'brands': list(brands),
            'features': features_data,
            'price_range': price_range,
            'categories': list(categories),
        }