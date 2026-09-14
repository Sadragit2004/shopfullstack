# apps/product/models/discount.py

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q


class ProductDiscount(models.Model):

    name = models.CharField(
        max_length=150,
    )

    products = models.ManyToManyField(
        "product.Product",
        related_name="discounts",
    )

    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
    )

    starts_at = models.DateTimeField()

    expires_at = models.DateTimeField()

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
        db_table = "product_discounts"
        verbose_name = "Product Discount"
        verbose_name_plural = "Product Discounts"
        ordering = ["-created_at"]

        constraints = [
            models.CheckConstraint(
                condition=Q(percentage__gt=0) & Q(percentage__lte=100),
                name="discount_percentage_between_0_and_100",
            ),
        ]

    def clean(self):
        super().clean()

        if self.percentage <= 0 or self.percentage > 100:
            raise ValidationError(
                "Discount percentage must be between 0 and 100."
            )

        if self.expires_at <= self.starts_at:
            raise ValidationError(
                "Discount expiration must be after the start date."
            )

    def __str__(self):
        return f"{self.name} - {self.percentage}%"