from rest_framework import serializers

from apps.product.models.feature import Feature


class FeatureSerializer(serializers.ModelSerializer):

    class Meta:
        model = Feature
        fields = (
            "id",
            "name",
            "key",
            "type",
            "is_active",
            "sort_order",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )