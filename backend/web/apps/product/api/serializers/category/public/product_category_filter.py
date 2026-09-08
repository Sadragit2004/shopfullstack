# apps/product/api/serializers/product/serializers.py
from rest_framework import serializers
from django.db.models import Min, Max
from apps.product.models.product import Product
from apps.product.models.brand import Brand
from apps.product.models.category import Category


class ProductFilterSerializer(serializers.ModelSerializer):
    """سریالایزر ساده برای نمایش محصول در لیست و فیلتر"""
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    brand_slug = serializers.CharField(source='brand.slug', read_only=True)
    category_names = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()          # قیمت پیش‌فرض
    min_price = serializers.SerializerMethodField()     # کمترین قیمت
    max_price = serializers.SerializerMethodField()     # بیشترین قیمت
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'title',
            'slug',
            'cover_image_url',
            'brand_name',
            'brand_slug',
            'price',              # قیمت پیش‌فرض
            'min_price',          # کمترین قیمت
            'max_price',          # بیشترین قیمت
            'category_names',
            'status',
        ]

    def get_category_names(self, obj):
        return list(obj.categories.filter(status='published').values_list('title', flat=True))

    def get_price(self, obj):
        """قیمت پیش‌فرض (اولین sale فعال)"""
        first_sale = obj.sales.filter(
            is_active=True,
            selling_price__gte=0
        ).first()
        return str(first_sale.selling_price) if first_sale else None

    def get_min_price(self, obj):
        """کمترین قیمت فروش محصول"""
        min_price = obj.sales.filter(
            is_active=True,
            selling_price__gte=0
        ).aggregate(min_price=Min('selling_price'))['min_price']
        return str(min_price) if min_price else None

    def get_max_price(self, obj):
        """بیشترین قیمت فروش محصول"""
        max_price = obj.sales.filter(
            is_active=True,
            selling_price__gte=0
        ).aggregate(max_price=Max('selling_price'))['max_price']
        return str(max_price) if max_price else None

    def get_cover_image_url(self, obj):
        if obj.cover_image:
            return obj.cover_image.url
        return None


class ProductFilterOptionSerializer(serializers.Serializer):
    """سریالایزر برای گزینه‌های فیلتر"""
    brands = serializers.ListField(child=serializers.DictField())
    features = serializers.ListField(child=serializers.DictField())
    price_range = serializers.DictField()
    categories = serializers.ListField(child=serializers.DictField())


class ProductListWithFilterResponseSerializer(serializers.Serializer):
    """سریالایزر نهایی پاسخ با فیلترها"""
    products = ProductFilterSerializer(many=True)
    filters = ProductFilterOptionSerializer()
    total_count = serializers.IntegerField()
    page = serializers.IntegerField()
    page_size = serializers.IntegerField()