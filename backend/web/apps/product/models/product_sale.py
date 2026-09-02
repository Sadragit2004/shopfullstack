from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q


class ProductSale(models.Model):
    product = models.ForeignKey(
        "product.Product",
        on_delete=models.CASCADE,
        related_name="sales",
    )

    variant = models.ForeignKey(
        "product.ProductVariant",
        on_delete=models.CASCADE,
        related_name="sales",
        null=True,
        blank=True,
    )

    sale_type = models.ForeignKey(
        "product.SaleType",
        on_delete=models.PROTECT,
        related_name="product_sales",
    )

    unit = models.ForeignKey(
        "product.Unit",
        on_delete=models.PROTECT,
        related_name="product_sales",
    )

    purchase_price = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        null=True,
        blank=True,
    )

    selling_price = models.DecimalField(
        max_digits=18,
        decimal_places=2,
    )

    minimum_quantity = models.PositiveIntegerField(
        default=1,
    )

    maximum_quantity = models.PositiveIntegerField(
        null=True,
        blank=True,
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
        db_table = "product_sales"
        verbose_name = "Product Sale"
        verbose_name_plural = "Product Sales"
        ordering = ["-created_at"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "product",
                    "variant",
                    "sale_type",
                    "unit",
                ],
                name="unique_product_sale",
            ),
            models.CheckConstraint(
                condition=Q(minimum_quantity__gte=1),
                name="sale_minimum_quantity_gte_one",
            ),
            models.CheckConstraint(
                condition=(
                    Q(maximum_quantity__isnull=True)
                    | Q(maximum_quantity__gte=1)
                ),
                name="sale_maximum_quantity_gte_one",
            ),
            models.CheckConstraint(
                condition=(
                    Q(maximum_quantity__isnull=True)
                    | Q(maximum_quantity__gte=models.F("minimum_quantity"))
                ),
                name="sale_maximum_gte_minimum",
            ),
            models.CheckConstraint(
                condition=Q(selling_price__gte=0),
                name="sale_selling_price_gte_zero",
            ),
            models.CheckConstraint(
                condition=(
                    Q(purchase_price__isnull=True)
                    | Q(purchase_price__gte=0)
                ),
                name="sale_purchase_price_gte_zero",
            ),
        ]

    def clean(self):
        super().clean()

        # فقط اگر variant انتخاب شده و product هم وجود داشته باشد
        if self.variant and self.product:
            if self.variant.product_id != self.product_id:
                raise ValidationError(
                    "Selected variant does not belong to the selected product."
                )

    def __str__(self):
        return f"{self.product.title} - {self.sale_type.name}"