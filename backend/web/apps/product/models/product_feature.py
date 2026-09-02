
from django.core.exceptions import ValidationError
from django.db import models


class ProductFeature(models.Model):

    product = models.ForeignKey(
        "product.Product",
        on_delete=models.CASCADE,
        related_name="features",
    )

    feature = models.ForeignKey(
        "product.Feature",
        on_delete=models.PROTECT,
        related_name="product_features",
    )

    feature_values = models.ManyToManyField(
        "product.FeatureValue",
        related_name="product_features",
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
        db_table = "product_feature_assignments"
        verbose_name = "Product Feature"
        verbose_name_plural = "Product Features"
        ordering = ["sort_order", "id"]

    def clean(self):
        super().clean()

        # -------------------------------------------------
        # IMPORTANT:
        # ManyToManyField در clean() قابل اتکا نیست.
        # چون M2M بعد از save شدن مدل ذخیره می‌شود.
        #
        # بنابراین validation مربوط به feature_values
        # در ProductFeatureForm انجام می‌شود.
        # -------------------------------------------------

    def __str__(self):
        # -------------------------------------------------
        # VERY IMPORTANT:
        # اگر instance هنوز ذخیره نشده باشد، به M2M دست نزن.
        # این دقیقاً جلوی RecursionError را می‌گیرد.
        # -------------------------------------------------

        product_title = (
            self.product.title
            if self.product_id
            else "New Product"
        )

        feature_name = (
            self.feature.name
            if self.feature_id
            else "Feature"
        )

        if not self.pk:
            return f"{product_title} - {feature_name}"

        values = ", ".join(
            self.feature_values.values_list("value", flat=True)
        )

        if self.custom_value:
            if values:
                values = f"{values} (Custom: {self.custom_value})"
            else:
                values = f"Custom: {self.custom_value}"

        return f"{product_title} - {feature_name}: {values}"

