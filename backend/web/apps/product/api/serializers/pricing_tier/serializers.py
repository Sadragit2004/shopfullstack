from rest_framework import serializers

from apps.product.models.pricing_tier import PricingTier


class PricingTierSerializer(serializers.ModelSerializer):

    class Meta:
        model = PricingTier

        fields = (
            "id",
            "product_sale",
            "min_quantity",
            "max_quantity",
            "price",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )