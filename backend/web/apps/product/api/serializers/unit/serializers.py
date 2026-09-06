from rest_framework import serializers

from apps.product.models.unit import Unit


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit

        fields = (
            "id",
            "name",
            "symbol",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )