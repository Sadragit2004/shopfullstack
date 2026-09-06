from django.db import models
from .manager.category.category import CategoryManager

class CategoryStatus(models.TextChoices):
    PUBLISHED = "published", "Published"
    UNPUBLISHED = "unpublished", "Unpublished"


class Category(models.Model):
    title = models.CharField(
        max_length=150,
    )

    parent = models.ForeignKey(
        "self",
        on_delete=models.PROTECT,
        related_name="children",
        null=True,
        blank=True,
    )

    image = models.ImageField(
        upload_to="products/categories/",
        null=True,
        blank=True,
    )

    slug = models.SlugField(
        max_length=180,
        unique=True,
        db_index=True,
    )

    status = models.CharField(
        max_length=20,
        choices=CategoryStatus.choices,
        default=CategoryStatus.UNPUBLISHED,
        db_index=True,
    )

    description = models.TextField(
        blank=True,
    )

    pdf = models.FileField(
        upload_to="products/categories/pdf/",
        null=True,
        blank=True,
    )

    video_file = models.FileField(
        upload_to="products/categories/videos/",
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

    objects = CategoryManager()

    class Meta:
        db_table = "product_categories"
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ["title"]

    def __str__(self):
        return self.title