from django.db import models
from .managers.payment_type import PaymentTypeManager


class PaymentType(models.Model):
    title = models.CharField(
        max_length=150,
    )

    is_active = models.BooleanField(
        default=True,
    )

    objects = PaymentTypeManager()

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        db_table = "order_payment_types"

        ordering = [
            "-created_at",
        ]

        indexes = [
            models.Index(
                fields=["is_active"],
                name="order_payment_active_idx",
            ),
        ]

    def __str__(self):
        return self.title