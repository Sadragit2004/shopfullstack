
from rest_framework import serializers

from ...models import OrderDetail

from .order_discount import OrderDiscountSerializer


class OrderDetailSerializer(serializers.ModelSerializer):
    discount = OrderDiscountSerializer(
        read_only=True,
    )

    class Meta:
        model = OrderDetail

        fields = [
            "id",

            # Product
            "product",
            "product_title",
            "product_slug",
            "product_image",
            "brand_name",

            # Variant
            "variant",
            "variant_title",
            "variant_sku",
            "variant_barcode",

            # Sale
            "product_sale",
            "pricing_tier",
            "sale_type_name",
            "unit_name",
            "unit_symbol",

            # Features
            "feature_snapshot",

            # Quantity
            "quantity",

            # Pricing
            "unit_price",
            "subtotal_price",

            # Product discount
            "product_discount_percent",
            "product_discount_amount",

            # Final pricing
            "final_unit_price",
            "total_price",

            # Internal
            "cost_price",

            # Discount snapshot
            "discount",

            "created_at",
        ]

        read_only_fields = [
            "id",

            "product",
            "product_title",
            "product_slug",
            "product_image",
            "brand_name",

            "variant",
            "variant_title",
            "variant_sku",
            "variant_barcode",

            "product_sale",
            "pricing_tier",
            "sale_type_name",
            "unit_name",
            "unit_symbol",

            "feature_snapshot",

            "quantity",

            "unit_price",
            "subtotal_price",

            "product_discount_percent",
            "product_discount_amount",

            "final_unit_price",
            "total_price",

            "cost_price",

            "discount",

            "created_at",
        ]

