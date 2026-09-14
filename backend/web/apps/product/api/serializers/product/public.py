from rest_framework import serializers

from django.db.models import Min, Max

from apps.product.models.brand import Brand
from apps.product.models.category import Category
from apps.product.models.discount import ProductDiscount
from apps.product.models.feature import Feature
from apps.product.models.feature_value import FeatureValue
from apps.product.models.inventory import Inventory
from apps.product.models.pricing_tier import PricingTier
from apps.product.models.product import Product
from apps.product.models.product_feature import ProductFeature
from apps.product.models.product_gallery import ProductGallery
from apps.product.models.product_sale import ProductSale
from apps.product.models.product_variant import ProductVariant
from apps.product.models.sale_type import SaleType
from apps.product.models.unit import Unit
from apps.product.models.variant_feature import VariantFeature


# ============================================================
# Brand
# ============================================================

class ProductDetailBrandSerializer(serializers.ModelSerializer):

    class Meta:
        model = Brand
        fields = (
            "id",
            "name",
            "slug",
            "logo",
            "description",
        )


# ============================================================
# Category
# ============================================================

class ProductDetailCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = (
            "id",
            "title",
            "slug",
            "image",
            "parent",
        )


# ============================================================
# Gallery
# ============================================================

class ProductDetailGallerySerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductGallery
        fields = (
            "id",
            "image",
            "sort_order",
        )


# ============================================================
# Feature Value
# ============================================================

class ProductDetailFeatureValueSerializer(serializers.ModelSerializer):

    class Meta:
        model = FeatureValue
        fields = (
            "id",
            "value",
            "sort_order",
        )


# ============================================================
# Feature
# ============================================================

class ProductDetailFeatureSerializer(serializers.ModelSerializer):

    class Meta:
        model = Feature
        fields = (
            "id",
            "name",
            "key",
            "type",
        )


# ============================================================
# Product Feature
# ============================================================

class ProductDetailProductFeatureSerializer(serializers.ModelSerializer):

    feature = ProductDetailFeatureSerializer(
        read_only=True,
    )

    feature_values = ProductDetailFeatureValueSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = ProductFeature
        fields = (
            "id",
            "feature",
            "feature_values",
            "custom_value",
            "sort_order",
        )


# ============================================================
# Variant Feature
# ============================================================

class ProductDetailVariantFeatureSerializer(serializers.ModelSerializer):

    feature = ProductDetailFeatureSerializer(
        read_only=True,
    )

    feature_values = ProductDetailFeatureValueSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = VariantFeature
        fields = (
            "id",
            "feature",
            "feature_values",
        )


# ============================================================
# Sale Type
# ============================================================

class ProductDetailSaleTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = SaleType
        fields = (
            "id",
            "name",
            "description",
        )


# ============================================================
# Unit
# ============================================================

class ProductDetailUnitSerializer(serializers.ModelSerializer):

    class Meta:
        model = Unit
        fields = (
            "id",
            "name",
            "symbol",
            "description",
        )


# ============================================================
# Inventory
# ============================================================

class ProductDetailInventorySerializer(serializers.ModelSerializer):

    is_available = serializers.SerializerMethodField()

    class Meta:
        model = Inventory
        fields = (
            "quantity",
            "is_available",
        )

    def get_is_available(self, obj):
        return bool(
            obj.is_active
            and obj.quantity > 0
        )


# ============================================================
# Pricing Tier
# ============================================================

class ProductDetailPricingTierSerializer(serializers.ModelSerializer):

    class Meta:
        model = PricingTier
        fields = (
            "id",
            "min_quantity",
            "max_quantity",
            "price",
        )


# ============================================================
# Sale
# ============================================================

class ProductDetailSaleSerializer(serializers.ModelSerializer):

    sale_type = ProductDetailSaleTypeSerializer(
        read_only=True,
    )

    unit = ProductDetailUnitSerializer(
        read_only=True,
    )

    inventory = ProductDetailInventorySerializer(
        read_only=True,
    )

    pricing_tiers = ProductDetailPricingTierSerializer(
        many=True,
        read_only=True,
    )

    is_available = serializers.SerializerMethodField()

    class Meta:
        model = ProductSale
        fields = (
            "id",
            "sale_type",
            "unit",
            "selling_price",
            "purchase_step",
            "minimum_quantity",
            "maximum_quantity",
            "inventory",
            "is_available",
            "pricing_tiers",
        )

    def get_is_available(self, obj):
        inventory = getattr(
            obj,
            "inventory",
            None,
        )

        if inventory is None:
            return True

        return bool(
            inventory.is_active
            and inventory.quantity > 0
        )


# ============================================================
# Product Discount
# ============================================================

class ProductDetailDiscountSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductDiscount
        fields = (
            "id",
            "name",
            "percentage",
            "starts_at",
            "expires_at",
        )


# ============================================================
# Variant
# ============================================================

class ProductDetailVariantSerializer(serializers.ModelSerializer):

    features = ProductDetailVariantFeatureSerializer(
        many=True,
        read_only=True,
    )

    sales = ProductDetailSaleSerializer(
        many=True,
        read_only=True,
    )

    is_available = serializers.SerializerMethodField()

    price = serializers.SerializerMethodField()

    min_price = serializers.SerializerMethodField()

    max_price = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = (
            "id",
            "title",
            "sku",
            "barcode",
            "features",
            "sales",
            "is_available",
            "price",
            "min_price",
            "max_price",
        )

    def get_is_available(self, obj):
        sales = list(
            obj.sales.all()
        )

        if not sales:
            return False

        return any(
            sale.is_available
            for sale in sales
        )

    def get_price(self, obj):
        sales = [
            sale
            for sale in obj.sales.all()
            if sale.selling_price is not None
            and sale.selling_price >= 0
        ]

        if not sales:
            return None

        return str(
            sales[0].selling_price
        )

    def get_min_price(self, obj):
        prices = [
            sale.selling_price
            for sale in obj.sales.all()
            if sale.selling_price is not None
            and sale.selling_price >= 0
        ]

        if not prices:
            return None

        return str(
            min(prices)
        )

    def get_max_price(self, obj):
        prices = [
            sale.selling_price
            for sale in obj.sales.all()
            if sale.selling_price is not None
            and sale.selling_price >= 0
        ]

        if not prices:
            return None

        return str(
            max(prices)
        )


# ============================================================
# Direct Product Sale
# ============================================================

class ProductDetailDirectSaleSerializer(
    ProductDetailSaleSerializer
):
    """
    Sales belonging directly to Product.
    Used when a product does not require variants.
    """

    pass


# ============================================================
# Related Product Feature
# ============================================================

class ProductRelatedFeatureSerializer(
    ProductDetailProductFeatureSerializer
):
    """
    ProductFeature representation for Related Products.
    """

    pass


# ============================================================
# Related Product
# ============================================================

class ProductRelatedProductSerializer(serializers.ModelSerializer):

    brand = ProductDetailBrandSerializer(
        read_only=True,
    )

    categories = ProductDetailCategorySerializer(
        many=True,
        read_only=True,
    )

    features = ProductRelatedFeatureSerializer(
        many=True,
        read_only=True,
    )

    price = serializers.SerializerMethodField()

    min_price = serializers.SerializerMethodField()

    max_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "title",
            "slug",
            "cover_image",
            "brand",
            "categories",
            "features",
            "price",
            "min_price",
            "max_price",
        )

    def get_price(self, obj):
        first_sale = obj.sales.filter(
            is_active=True,
            selling_price__gte=0,
            variant__isnull=True,
        ).first()

        return (
            str(first_sale.selling_price)
            if first_sale
            else None
        )

    def get_min_price(self, obj):
        min_price = obj.sales.filter(
            is_active=True,
            selling_price__gte=0,
        ).aggregate(
            min_price=Min("selling_price")
        )["min_price"]

        return (
            str(min_price)
            if min_price is not None
            else None
        )

    def get_max_price(self, obj):
        max_price = obj.sales.filter(
            is_active=True,
            selling_price__gte=0,
        ).aggregate(
            max_price=Max("selling_price")
        )["max_price"]

        return (
            str(max_price)
            if max_price is not None
            else None
        )


# ============================================================
# Product Detail
# ============================================================

class ProductDetailSerializer(serializers.ModelSerializer):

    brand = ProductDetailBrandSerializer(
        read_only=True,
    )

    categories = ProductDetailCategorySerializer(
        many=True,
        read_only=True,
    )

    gallery = ProductDetailGallerySerializer(
        many=True,
        read_only=True,
    )

    features = ProductDetailProductFeatureSerializer(
        many=True,
        read_only=True,
    )

    variants = ProductDetailVariantSerializer(
        many=True,
        read_only=True,
    )

    sales = ProductDetailDirectSaleSerializer(
        many=True,
        read_only=True,
    )

    discounts = ProductDetailDiscountSerializer(
        source="active_discounts",
        many=True,
        read_only=True,
    )

    related_products = ProductRelatedProductSerializer(
        many=True,
        read_only=True,
    )

    has_variants = serializers.SerializerMethodField()

    price = serializers.SerializerMethodField()

    min_price = serializers.SerializerMethodField()

    max_price = serializers.SerializerMethodField()

    class Meta:
        model = Product

        fields = (
            "id",
            "title",
            "slug",
            "status",
            "description",
            "brand",
            "categories",
            "cover_image",
            "gallery",
            "pdf",
            "video_file",
            "video_url",
            "features",
            "has_variants",
            "variants",
            "sales",
            "discounts",
            "related_products",
            "price",
            "min_price",
            "max_price",
            "created_at",
            "updated_at",
        )

    def get_has_variants(self, obj):
        variants = getattr(
            obj,
            "variants",
            None,
        )

        if variants is None:
            return False

        return variants.exists()

    def get_price(self, obj):
        """
        قیمت پیش‌فرض محصول.

        اگر محصول Variant داشته باشد،
        قیمت از Variantها گرفته می‌شود.

        در غیر این صورت Sale مستقیم محصول.
        """

        variants = list(
            obj.variants.all()
        )

        if variants:

            prices = []

            for variant in variants:

                for sale in variant.sales.all():

                    if (
                        sale.selling_price is not None
                        and sale.selling_price >= 0
                    ):
                        prices.append(
                            sale.selling_price
                        )

            if prices:
                return str(
                    min(prices)
                )

            return None

        first_sale = obj.sales.filter(
            is_active=True,
            selling_price__gte=0,
        ).first()

        return (
            str(first_sale.selling_price)
            if first_sale
            else None
        )

    def get_min_price(self, obj):
        variants = list(
            obj.variants.all()
        )

        if variants:

            prices = []

            for variant in variants:

                for sale in variant.sales.all():

                    if (
                        sale.selling_price is not None
                        and sale.selling_price >= 0
                    ):
                        prices.append(
                            sale.selling_price
                        )

            if prices:
                return str(
                    min(prices)
                )

            return None

        min_price = obj.sales.filter(
            is_active=True,
            selling_price__gte=0,
        ).aggregate(
            min_price=Min("selling_price")
        )["min_price"]

        return (
            str(min_price)
            if min_price is not None
            else None
        )

    def get_max_price(self, obj):
        variants = list(
            obj.variants.all()
        )

        if variants:

            prices = []

            for variant in variants:

                for sale in variant.sales.all():

                    if (
                        sale.selling_price is not None
                        and sale.selling_price >= 0
                    ):
                        prices.append(
                            sale.selling_price
                        )

            if prices:
                return str(
                    max(prices)
                )

            return None

        max_price = obj.sales.filter(
            is_active=True,
            selling_price__gte=0,
        ).aggregate(
            max_price=Max("selling_price")
        )["max_price"]

        return (
            str(max_price)
            if max_price is not None
            else None
        )