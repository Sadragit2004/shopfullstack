from django.db import models


class FeatureType(models.TextChoices):
    TEXT = "text", "Text"
    NUMBER = "number", "Number"
    BOOLEAN = "boolean", "Boolean"
    SELECT = "select", "Select"
    MULTI_SELECT = "multi_select", "Multi Select"


class Feature(models.Model):
    name = models.CharField(
        max_length=150,
    )

    key = models.SlugField(
        max_length=150,
        unique=True,
        db_index=True,
    )

    type = models.CharField(
        max_length=20,
        choices=FeatureType.choices,
        default=FeatureType.TEXT,
        db_index=True,
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True,
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
        db_table = "product_features"
        verbose_name = "Feature"
        verbose_name_plural = "Features"
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name