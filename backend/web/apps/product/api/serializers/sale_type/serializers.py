from rest_framework import serializers

from apps.product.models.sale_type import SaleType


class SaleTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleType
        fields = (
            "id",
            "name",
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