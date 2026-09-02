from rest_framework import serializers

from apps.product.models.feature_value import FeatureValue


class FeatureValueSerializer(serializers.ModelSerializer):

    class Meta:
        model = FeatureValue
        fields = (
            "id",
            "feature",
            "value",
            "sort_order",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )