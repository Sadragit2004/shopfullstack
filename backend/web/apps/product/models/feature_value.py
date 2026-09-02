from django.db import models


class FeatureValue(models.Model):
    feature = models.ForeignKey(
        "product.Feature",
        on_delete=models.CASCADE,
        related_name="values",
    )

    value = models.CharField(
        max_length=255,
    )

    sort_order = models.PositiveIntegerField(
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
        db_table = "product_feature_values"
        verbose_name = "Feature Value"
        verbose_name_plural = "Feature Values"
        ordering = ["sort_order", "value"]

        constraints = [
            models.UniqueConstraint(
                fields=["feature", "value"],
                name="unique_feature_value",
            ),
        ]

    def __str__(self):
        return f"{self.feature.name}: {self.value}"