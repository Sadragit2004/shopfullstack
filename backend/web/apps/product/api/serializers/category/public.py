from rest_framework import serializers

from apps.product.models.category import Category
from apps.product.models.product import Product
from apps.product.models.brand import Brand
from apps.product.models.feature import Feature
from apps.product.models.feature_value import FeatureValue
from apps.product.models.inventory import Inventory
from apps.product.models.pricing_tier import PricingTier
from apps.product.models.product_feature import ProductFeature
from apps.product.models.product_gallery import ProductGallery
from apps.product.models.product_sale import ProductSale
from apps.product.models.product_variant import ProductVariant
from apps.product.models.sale_type import SaleType
from apps.product.models.unit import Unit
from apps.product.models.variant_feature import VariantFeature


# ============================================================
# Category Popular
# ============================================================

class CategoryPopularSerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = (
            "title",
            "image",
            "slug",
        )


# ============================================================
# Category Mega Menu
# ============================================================

class CategoryMegaMenuSerializer(serializers.ModelSerializer):

    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            "title",
            "image",
            "slug",
            "children",
        )

    def get_children(self, obj):
        children = obj.children.all()

        return CategoryMegaMenuSerializer(
            children,
            many=True,
            context=self.context,
        ).data


# ============================================================
# Brand
# ============================================================

class CategoryProductBrandSerializer(serializers.ModelSerializer):

    class Meta:
        model = Brand
        fields = (
            "id",
            "name",
            "slug",
            "logo",
        )


