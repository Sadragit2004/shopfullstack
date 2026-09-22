# apps/order/models/managers/order_status.py

from django.db import models


class OrderStatusManager(models.Manager):

    def active(self):
        return self.filter(
            is_active=True,
        )

    def get_by_code(self, code):
        return self.filter(
            code=code,
            is_active=True,
        ).first()

    def create_status(
        self,
        *,
        code,
        title,
        is_active=True,
    ):
        from ..services.order_status import OrderStatusService

        return OrderStatusService.create(
            code=code,
            title=title,
            is_active=is_active,
        )