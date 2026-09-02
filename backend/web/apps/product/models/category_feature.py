from django.core.exceptions import ValidationError
from django.db import models


class CategoryFeature(models.Model):
    category = models.ForeignKey(
        "product.Category",
        on_delete=models.CASCADE,
        related_name="features",
    )

    feature = models.ForeignKey(
        "product.Feature",
        on_delete=models.PROTECT,
        related_name="category_features",
    )

    feature_value = models.ForeignKey(
        "product.FeatureValue",
        on_delete=models.PROTECT,
        related_name="category_features",
        null=True,
        blank=True,
    )

    custom_value = models.CharField(
        max_length=500,
        null=True,
        blank=True,
    )

    sort_order = models.PositiveIntegerField(
        default=0,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "product_category_features"
        verbose_name = "Category Feature"
        verbose_name_plural = "Category Features"
        ordering = ["sort_order", "id"]

    def clean(self):
        super().clean()

        if not self.feature_value and not self.custom_value:
            raise ValidationError(
                "Feature must have either a predefined value or a custom value."
            )

        if (
            self.feature_value
            and self.feature_value.feature_id != self.feature_id
        ):
            raise ValidationError(
                "Selected feature value does not belong to the selected feature."
            )

    def __str__(self):
        return f"{self.category.title} - {self.feature.name}"