
from django.db import transaction

from ..order_status import OrderStatus


class OrderStatusService:
    @staticmethod
    @transaction.atomic
    def create(
        *,
        code,
        title,
        is_active=True,
    ):
        return OrderStatus.objects.create(
            code=code,
            title=title,
            is_active=is_active,
        )

    @staticmethod
    def get_active_by_code(code):
        return (
            OrderStatus.objects
            .filter(
                code=code,
                is_active=True,
            )
            .first()
        )

