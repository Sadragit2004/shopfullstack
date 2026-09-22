from rest_framework import serializers

from ...models import Order

from .order_detail import OrderDetailSerializer
from .order_coupon import CouponValidateSerializer


class OrderSerializer(serializers.ModelSerializer):
    details = OrderDetailSerializer(
        many=True,
        read_only=True,
    )

    coupon = CouponValidateSerializer(
        read_only=True,
    )

    user_address_id = serializers.SerializerMethodField()

    class Meta:
        model = Order

        fields = [
            "id",
            "uuid",

            # Relations
            "user",
            "status",
            "logistics",
            "payment_type",

            # Pricing
            "subtotal_price",
            "product_discount_amount",
            "coupon_discount_amount",
            "shipping_price",
            "discount_percent",
            "total_price",

            # Address
            "user_address_id",

            # Nested
            "details",
            "coupon",

            # Dates
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "uuid",
            "user",

            "status",
            "logistics",
            "payment_type",

            "subtotal_price",
            "product_discount_amount",
            "coupon_discount_amount",
            "shipping_price",
            "discount_percent",
            "total_price",

            "user_address_id",

            "details",
            "coupon",

            "created_at",
            "updated_at",
        ]

    def get_user_address_id(self, obj):
        order_address = getattr(obj, "order_address", None)

        if order_address is None:
            return None

        return order_address.user_address_id