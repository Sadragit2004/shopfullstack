from rest_framework import serializers

from apps.product.models.inventory import Inventory


class InventorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Inventory

        fields = (
            "id",
            "product_sale",
            "quantity",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )