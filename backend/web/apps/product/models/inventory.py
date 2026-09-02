from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q


class Inventory(models.Model):
    
    product_sale = models.OneToOneField(
        "product.ProductSale",
        on_delete=models.CASCADE,
        related_name="inventory",
    )

    quantity = models.DecimalField(
        max_digits=18,
        decimal_places=3,
        default=0,
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "product_inventory"
        verbose_name = "Inventory"
        verbose_name_plural = "Inventory"

        constraints = [
            models.CheckConstraint(
                condition=Q(quantity__gte=0),
                name="inventory_quantity_gte_zero",
            ),
        ]

    def clean(self):
        super().clean()

        if self.quantity < 0:
            raise ValidationError(
                "Inventory quantity cannot be negative."
            )

    def __str__(self):
        return f"{self.product_sale} - {self.quantity}"