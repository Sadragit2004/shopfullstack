from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models

from .managers.logistics import LogisticsManager


class Logistics(models.Model):

    class Type(models.TextChoices):
        FREIGHT = "freight", "باربری"
        CASH_ON_DELIVERY = "cash_on_delivery", "پرداخت در محل"

    type = models.CharField(
        max_length=30,
        choices=Type.choices,
    )

    title = models.CharField(
        max_length=150,
    )

    price = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal("0"),
        validators=[
            MinValueValidator(Decimal("0")),
        ],
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    objects = LogisticsManager()

    class Meta:
        db_table = "order_logistics"

        ordering = [
            "-created_at",
        ]

        indexes = [
            models.Index(
                fields=["type"],
                name="order_logistic_type_idx",
            ),
            models.Index(
                fields=["is_active"],
                name="order_logistic_active_idx",
            ),
        ]

    def __str__(self):
        return self.title