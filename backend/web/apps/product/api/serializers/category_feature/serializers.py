from rest_framework import serializers

from apps.product.models.category_feature import CategoryFeature


class CategoryFeatureSerializer(serializers.ModelSerializer):

    class Meta:
        model = CategoryFeature

        fields = (
            "id",
            "category",
            "feature",
            "feature_value",
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