from django.db import transaction

from ..payment_type import PaymentType
from ..order import Order


class PaymentTypeService:

    @staticmethod
    @transaction.atomic
    def create(
        *,
        title,
        is_active=True,
    ):
        return PaymentType.objects.create(
            title=title,
            is_active=is_active,
        )

    @staticmethod
    def get_active(payment_type_id):
        return PaymentType.objects.filter(
            id=payment_type_id,
            is_active=True,
        ).first()

    @staticmethod
    def get_active_list():
        return PaymentType.objects.active()

    @staticmethod
    @transaction.atomic
    def set_order_payment_type(
        *,
        order_id,
        payment_type_id,
    ):
        order = (
            Order.objects
            .select_for_update()
            .filter(
                id=order_id,
            )
            .first()
        )

        if not order:
            return None

        payment_type = (
            PaymentType.objects
            .filter(
                id=payment_type_id,
                is_active=True,
            )
            .first()
        )

        if not payment_type:
            return None

        order.payment_type = payment_type

        order.save(
            update_fields=[
                "payment_type",
            ],
        )

        return order