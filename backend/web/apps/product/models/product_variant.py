from django.db import models


class ProductVariant(models.Model):
    product = models.ForeignKey(
        "product.Product",
        on_delete=models.CASCADE,
        related_name="variants",
    )

    title = models.CharField(
        max_length=200,
        blank=True,
    )

    sku = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
    )

    barcode = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
        db_index=True,
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
        db_table = "product_variants"
        verbose_name = "Product Variant"
        verbose_name_plural = "Product Variants"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title or self.sku