from rest_framework import serializers

from apps.product.models.variant_feature import VariantFeature


class VariantFeatureSerializer(serializers.ModelSerializer):

    class Meta:
        model = VariantFeature

        fields = (
            "id",
            "variant",
            "feature",
            "feature_values",
            "created_at",
        )

        read_only_fields = (
            "id",
            "created_at",
        )