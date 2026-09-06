from rest_framework import serializers

from apps.product.models.product_sale import ProductSale


class ProductSaleSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductSale

        fields = (
            "id",
            "product",
            "variant",
            "sale_type",
            "unit",
            "purchase_price",
            "selling_price",
            "minimum_quantity",
            "maximum_quantity",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )