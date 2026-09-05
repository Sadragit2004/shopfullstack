from rest_framework import serializers

from apps.product.models.product_feature import ProductFeature


class ProductFeatureSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductFeature

        fields = (
            "id",
            "product",
            "feature",
            "feature_values",
            "custom_value",
            "sort_order",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )