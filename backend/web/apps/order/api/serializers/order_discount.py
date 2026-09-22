
from rest_framework import serializers

from ...models import OrderDiscount


class OrderDiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderDiscount

        fields = [
            "id",
            "name",
            "percentage",
            "amount",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]

