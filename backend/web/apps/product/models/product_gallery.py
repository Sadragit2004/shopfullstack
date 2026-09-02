from django.db import models


class ProductGallery(models.Model):
    product = models.ForeignKey(
        "product.Product",
        on_delete=models.CASCADE,
        related_name="gallery",
    )

    image = models.ImageField(
        upload_to="products/gallery/",
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

    class Meta:
        db_table = "product_galleries"
        verbose_name = "Product Gallery"
        verbose_name_plural = "Product Galleries"
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.product.title} - {self.id}"