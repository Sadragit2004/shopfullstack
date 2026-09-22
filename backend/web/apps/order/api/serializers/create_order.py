from decimal import Decimal

from rest_framework import serializers


class CreateOrderItemSerializer(serializers.Serializer):
    product_sale_id = serializers.IntegerField(
        min_value=1,
    )

    quantity = serializers.DecimalField(
        max_digits=18,
        decimal_places=3,
        min_value=Decimal("0.001"),
    )


class CreateOrderSerializer(serializers.Serializer):
    items = CreateOrderItemSerializer(
        many=True,
        allow_empty=False,
    )

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError(
                "حداقل یک محصول برای ثبت سفارش لازم است."
            )

        return value