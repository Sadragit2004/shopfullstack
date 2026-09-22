
from django.core.exceptions import ValidationError
from django.db import transaction

from ..order import Order
from ..order_address import OrderAddress
from apps.user.models.user_address import UserAddress


class OrderAddressService:

    # ============================================================
    # Create / Set Order Address
    # ============================================================

    @staticmethod
    @transaction.atomic
    def set_order_address(
        order_id,
        user,
        user_address_id,
    ):
        # --------------------------------------------------------
        # Order
        # --------------------------------------------------------

        order = (
            Order.objects
            .select_for_update()
            .filter(
                id=order_id,
                user=user,
            )
            .first()
        )

        if order is None:
            raise ValidationError(
                "سفارش مورد نظر پیدا نشد."
            )

        # --------------------------------------------------------
        # User Address
        # --------------------------------------------------------

        user_address = (
            UserAddress.objects
            .filter(
                id=user_address_id,
                user=user,
            )
            .first()
        )

        if user_address is None:
            raise ValidationError(
                "آدرس انتخاب شده متعلق به شما نیست."
            )

        # --------------------------------------------------------
        # Create / Update
        # --------------------------------------------------------

        order_address, created = (
            OrderAddress.objects
            .update_or_create(
                order=order,
                defaults={
                    "user_address": user_address,
                },
            )
        )

        return order_address, created

    # ============================================================
    # Get Order Address
    # ============================================================

    @staticmethod
    def get_order_address(
        order_id,
        user,
    ):
        return (
            OrderAddress.objects
            .select_related(
                "order",
                "user_address",
            )
            .filter(
                order_id=order_id,
                order__user=user,
            )
            .first()
        )

    # ============================================================
    # Delete Order Address
    # ============================================================

    @staticmethod
    @transaction.atomic
    def delete_order_address(
        order_id,
        user,
    ):
        deleted_count, _ = (
            OrderAddress.objects
            .filter(
                order_id=order_id,
                order__user=user,
            )
            .delete()
        )

        return deleted_count > 0

