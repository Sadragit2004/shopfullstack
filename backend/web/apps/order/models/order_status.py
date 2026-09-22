# apps/order/models/order_status.py

from django.db import models


class OrderStatus(models.Model):
    code = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
    )

    title = models.CharField(
        max_length=100,
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        db_table = "order_statuses"
        verbose_name = "Order Status"
        verbose_name_plural = "Order Statuses"
        ordering = [
            "created_at",
        ]

    def __str__(self):
        return self.title