
from django.db import models


class VariantFeature(models.Model):

    variant = models.ForeignKey(
        "product.ProductVariant",
        on_delete=models.CASCADE,
        related_name="features",
    )

    feature = models.ForeignKey(
        "product.Feature",
        on_delete=models.PROTECT,
        related_name="variant_features",
    )

    feature_values = models.ManyToManyField(
        "product.FeatureValue",
        related_name="variant_features",
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        db_table = "product_variant_features"
        verbose_name = "Variant Feature"
        verbose_name_plural = "Variant Features"

        constraints = [
            models.UniqueConstraint(
                fields=["variant", "feature"],
                name="unique_variant_feature",
            ),
        ]

    def clean(self):
        super().clean()

        # -------------------------------------------------
        # M2M validation در Form انجام می‌شود.
        # در clean مدل به feature_values دست نمی‌زنیم.
        # -------------------------------------------------

    def __str__(self):
        variant_title = (
            str(self.variant)
            if self.variant_id
            else "New Variant"
        )

        feature_name = (
            self.feature.name
            if self.feature_id
            else "Feature"
        )

        # مهم:
        # قبل از ذخیره شدن، M2M را نخوان
        if not self.pk:
            return f"{variant_title} - {feature_name}"

        values = ", ".join(
            self.feature_values.values_list("value", flat=True)
        )

        return f"{variant_title} - {feature_name}: {values}"

