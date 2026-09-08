# apps/product/api/serializers/brand/serializers.py
from rest_framework import serializers
from apps.product.models.brand import Brand
from apps.product.models.product import Product
from apps.product.models.category import Category
from apps.product.models.product_sale import ProductSale


# ============================================================
# Category Serializers (مخصوص برند)
# ============================================================
class BrandCategoryListSerializer(serializers.ModelSerializer):
    """سریالایزر دسته‌بندی برای برند"""
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = [
            'id',
            'title',
            'slug',
            'image',
            'product_count',
        ]


class BrandCategorySimpleSerializer(serializers.ModelSerializer):
    """سریالایزر ساده دسته‌بندی برای برند"""

    class Meta:
        model = Category
        fields = [
            'id',
            'title',
            'slug',
        ]


# ============================================================
# Product Serializers (مخصوص برند)
# ============================================================
class BrandProductSalePriceSerializer(serializers.ModelSerializer):
    """سریالایزر قیمت فروش محصول برای برند"""
    sale_type_name = serializers.CharField(
        source='sale_type.name',
        read_only=True
    )
    unit_symbol = serializers.CharField(
        source='unit.symbol',
        read_only=True
    )

    class Meta:
        model = ProductSale
        fields = [
            'selling_price',
            'sale_type_name',
            'unit_symbol',
            'is_active',
        ]


class BrandProductListSerializer(serializers.ModelSerializer):
    """سریالایزر لیست محصولات برای برند"""
    cover_image_url = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()       # قیمت پیش‌فرض
    min_price = serializers.SerializerMethodField()   # کمترین قیمت
    max_price = serializers.SerializerMethodField()   # بیشترین قیمت
    categories = BrandCategorySimpleSerializer(many=True, read_only=True)
    brand_name = serializers.CharField(
        source='brand.name',
        read_only=True
    )
    brand_slug = serializers.CharField(
        source='brand.slug',
        read_only=True
    )

    class Meta:
        model = Product
        fields = [
            'id',
            'title',
            'slug',
            'cover_image_url',
            'brand_name',
            'brand_slug',
            'categories',
            'price',          # قیمت پیش‌فرض
            'min_price',      # کمترین قیمت
            'max_price',      # بیشترین قیمت
            'status',
            'created_at',
        ]

    def get_cover_image_url(self, obj):
        if obj.cover_image:
            return obj.cover_image.url
        return None

    def get_price(self, obj):
        """دریافت قیمت پیش‌فرض (اولین sale فعال)"""
        first_sale = obj.sales.filter(
            is_active=True,
            selling_price__gte=0
        ).first()

        if first_sale:
            return str(first_sale.selling_price)
        return None

    def get_min_price(self, obj):
        """کمترین قیمت فروش محصول"""
        min_price = obj.sales.filter(
            is_active=True,
            selling_price__gte=0
        ).aggregate(
            min_price=serializers.models.Min('selling_price')
        )['min_price']
        return str(min_price) if min_price is not None else None

    def get_max_price(self, obj):
        """بیشترین قیمت فروش محصول"""
        max_price = obj.sales.filter(
            is_active=True,
            selling_price__gte=0
        ).aggregate(
            max_price=serializers.models.Max('selling_price')
        )['max_price']
        return str(max_price) if max_price is not None else None


class BrandProductDetailSerializer(serializers.ModelSerializer):
    """سریالایزر جزئیات محصول برای برند"""
    cover_image_url = serializers.SerializerMethodField()
    categories = BrandCategorySimpleSerializer(many=True, read_only=True)
    brand_name = serializers.CharField(
        source='brand.name',
        read_only=True
    )
    brand_slug = serializers.CharField(
        source='brand.slug',
        read_only=True
    )
    prices = BrandProductSalePriceSerializer(
        source='sales',
        many=True,
        read_only=True
    )
    price = serializers.SerializerMethodField()
    min_price = serializers.SerializerMethodField()
    max_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'title',
            'slug',
            'cover_image_url',
            'brand_name',
            'brand_slug',
            'categories',
            'description',
            'prices',
            'price',          # قیمت پیش‌فرض
            'min_price',      # کمترین قیمت
            'max_price',      # بیشترین قیمت
            'status',
            'created_at',
            'updated_at',
        ]

    def get_cover_image_url(self, obj):
        if obj.cover_image:
            return obj.cover_image.url
        return None

    def get_price(self, obj):
        """دریافت قیمت پیش‌فرض (اولین sale فعال)"""
        first_sale = obj.sales.filter(
            is_active=True,
            selling_price__gte=0
        ).first()

        if first_sale:
            return str(first_sale.selling_price)
        return None

    def get_min_price(self, obj):
        min_price = obj.sales.filter(
            is_active=True,
            selling_price__gte=0
        ).aggregate(
            min_price=serializers.models.Min('selling_price')
        )['min_price']
        return str(min_price) if min_price is not None else None

    def get_max_price(self, obj):
        max_price = obj.sales.filter(
            is_active=True,
            selling_price__gte=0
        ).aggregate(
            max_price=serializers.models.Max('selling_price')
        )['max_price']
        return str(max_price) if max_price is not None else None


# ============================================================
# Brand Serializers
# ============================================================
class BrandListSerializer(serializers.ModelSerializer):
    """سریالایزر لیست برندها"""
    logo_url = serializers.SerializerMethodField()
    product_count = serializers.IntegerField(read_only=True)
    content_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Brand
        fields = [
            'id',
            'name',
            'slug',
            'logo_url',
            'description',
            'product_count',
            'content_count',
            'is_active',
            'created_at',
        ]

    def get_logo_url(self, obj):
        if obj.logo:
            return obj.logo.url
        return None


class BrandDetailSerializer(serializers.ModelSerializer):
    """سریالایزر جزئیات برند"""
    logo_url = serializers.SerializerMethodField()
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Brand
        fields = [
            'id',
            'name',
            'slug',
            'logo_url',
            'description',
            'product_count',
            'is_active',
            'created_at',
            'updated_at',
        ]

    def get_logo_url(self, obj):
        if obj.logo:
            return obj.logo.url
        return None


class BrandWithProductsSerializer(serializers.ModelSerializer):
    """سریالایزر برند با محصولات"""
    logo_url = serializers.SerializerMethodField()
    products = BrandProductListSerializer(
        many=True,
        read_only=True
    )
    categories = serializers.SerializerMethodField()
    total_products = serializers.IntegerField(read_only=True)

    class Meta:
        model = Brand
        fields = [
            'id',
            'name',
            'slug',
            'logo_url',
            'description',
            'products',
            'categories',
            'total_products',
            'is_active',
            'created_at',
            'updated_at',
        ]

    def get_logo_url(self, obj):
        if obj.logo:
            return obj.logo.url
        return None

    def get_categories(self, obj):
        """دریافت دسته‌بندی‌های مرتبط با برند"""
        categories = Category.objects.filter(
            products__brand=obj,
            products__status='published',
            status='published'
        ).distinct().order_by('title')
        return BrandCategorySimpleSerializer(categories, many=True).data


class BrandWithProductsFilterSerializer(serializers.Serializer):
    """سریالایزر برند با محصولات و فیلتر دسته‌بندی"""
    brand = BrandDetailSerializer()
    categories = BrandCategoryListSerializer(many=True)
    products = BrandProductListSerializer(many=True)
    pagination = serializers.DictField()
    total_products = serializers.IntegerField()


# ============================================================
# Admin Serializers
# ============================================================
class BrandAdminSerializer(serializers.ModelSerializer):
    """سریالایزر برند برای پنل ادمین"""
    logo_url = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = [
            'id',
            'name',
            'slug',
            'logo_url',
            'description',
            'product_count',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'created_at',
            'updated_at',
        ]

    def get_logo_url(self, obj):
        if obj.logo:
            return obj.logo.url
        return None

    def get_product_count(self, obj):
        return obj.products.filter(status='published').count()


class BrandCreateUpdateSerializer(serializers.ModelSerializer):
    """سریالایزر ایجاد و بروزرسانی برند"""

    class Meta:
        model = Brand
        fields = [
            'name',
            'slug',
            'logo',
            'description',
            'is_active',
        ]

    def validate_slug(self, value):
        """اعتبارسنجی اسلاگ"""
        if Brand.objects.filter(slug=value).exists():
            raise serializers.ValidationError(
                'یک برند با این اسلاگ قبلاً ثبت شده است.'
            )
        return value