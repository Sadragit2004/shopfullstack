from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q


class PricingTier(models.Model):
    product_sale = models.ForeignKey(
        "product.ProductSale",
        on_delete=models.CASCADE,
        related_name="pricing_tiers",
    )

    min_quantity = models.PositiveIntegerField()

    max_quantity = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    price = models.DecimalField(
        max_digits=18,
        decimal_places=2,
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
        db_table = "product_pricing_tiers"
        verbose_name = "Pricing Tier"
        verbose_name_plural = "Pricing Tiers"
        ordering = ["min_quantity"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "product_sale",
                    "min_quantity",
                    "max_quantity",
                ],
                name="unique_product_pricing_tier",
            ),
            models.CheckConstraint(
                condition=Q(min_quantity__gte=1),
                name="tier_min_quantity_gte_one",
            ),
            models.CheckConstraint(
                condition=(
                    Q(max_quantity__isnull=True)
                    | Q(max_quantity__gte=models.F("min_quantity"))
                ),
                name="tier_max_quantity_gte_minimum",
            ),
            models.CheckConstraint(
                condition=Q(price__gte=0),
                name="tier_price_gte_zero",
            ),
        ]

    def clean(self):
        super().clean()

        if (
            self.max_quantity is not None
            and self.max_quantity < self.min_quantity
        ):
            raise ValidationError(
                "Maximum quantity cannot be lower than minimum quantity."
            )

    def __str__(self):
        if self.max_quantity is None:
            quantity = f"{self.min_quantity}+"
        else:
            quantity = f"{self.min_quantity}-{self.max_quantity}"

        return f"{quantity} - {self.price}"