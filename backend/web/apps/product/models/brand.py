from django.db import models


class Brand(models.Model):
    
    name = models.CharField(
        max_length=150,
    )

    slug = models.SlugField(
        max_length=180,
        unique=True,
        db_index=True,
    )

    logo = models.ImageField(
        upload_to="products/brands/",
        null=True,
        blank=True,
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
        db_table = "product_brands"
        verbose_name = "Brand"
        verbose_name_plural = "Brands"
        ordering = ["name"]

    def __str__(self):
        return self.name