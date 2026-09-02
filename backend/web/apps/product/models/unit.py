from django.db import models


class Unit(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
    )

    symbol = models.CharField(
        max_length=30,
        unique=True,
    )

    description = models.TextField(
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
        db_table = "product_units"
        verbose_name = "Unit"
        verbose_name_plural = "Units"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.symbol})"