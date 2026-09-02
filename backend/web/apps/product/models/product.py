from django.db import models


class ProductStatus(models.TextChoices):
    PUBLISHED = "published", "Published"
    UNPUBLISHED = "unpublished", "Unpublished"


class Product(models.Model):
    brand = models.ForeignKey(
        "product.Brand",
        on_delete=models.SET_NULL,
        related_name="products",
        null=True,
        blank=True,
    )

    categories = models.ManyToManyField(
        "product.Category",
        related_name="products",
    )

    title = models.CharField(
        max_length=200,
    )

    cover_image = models.ImageField(
        upload_to="products/covers/",
        null=True,
        blank=True,
    )

    slug = models.SlugField(
        max_length=220,
        unique=True,
        db_index=True,
    )

    status = models.CharField(
        max_length=20,
        choices=ProductStatus.choices,
        default=ProductStatus.UNPUBLISHED,
        db_index=True,
    )

    description = models.TextField(
        blank=True,
    )

    pdf = models.FileField(
        upload_to="products/pdf/",
        null=True,
        blank=True,
    )

    video_file = models.FileField(
        upload_to="products/videos/",
        null=True,
        blank=True,
    )

    video_url = models.URLField(
        max_length=500,
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "products"
        verbose_name = "Product"
        verbose_name_plural = "Products"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title