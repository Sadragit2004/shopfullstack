from decimal import Decimal

from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class OrderDetail(models.Model):

    order = models.ForeignKey(
        "order.Order",
        on_delete=models.CASCADE,
        related_name="details",
    )

    # =========================================================
    # REFERENCES
    # =========================================================

    product = models.ForeignKey(
        "product.Product",
        on_delete=models.PROTECT,
        related_name="order_details",
    )

    variant = models.ForeignKey(
        "product.ProductVariant",
        on_delete=models.PROTECT,
        related_name="order_details",
        null=True,
        blank=True,
    )

    product_sale = models.ForeignKey(
        "product.ProductSale",
        on_delete=models.PROTECT,
        related_name="order_details",
    )

    pricing_tier = models.ForeignKey(
        "product.PricingTier",
        on_delete=models.SET_NULL,
        related_name="order_details",
        null=True,
        blank=True,
    )

    # =========================================================
    # PRODUCT SNAPSHOT
    # =========================================================

    product_title = models.CharField(
        max_length=200,
    )

    product_slug = models.CharField(
        max_length=220,
    )

    product_image = models.CharField(
        max_length=500,
        blank=True,
    )

    brand_name = models.CharField(
        max_length=150,
        blank=True,
    )

    # =========================================================
    # VARIANT SNAPSHOT
    # =========================================================

    variant_title = models.CharField(
        max_length=200,
        blank=True,
    )

    variant_sku = models.CharField(
        max_length=100,
        blank=True,
    )

    variant_barcode = models.CharField(
        max_length=100,
        blank=True,
    )

    # =========================================================
    # SALE SNAPSHOT
    # =========================================================

    sale_type_name = models.CharField(
        max_length=100,
    )

    unit_name = models.CharField(
        max_length=100,
    )

    unit_symbol = models.CharField(
        max_length=30,
    )

    # =========================================================
    # FEATURE SNAPSHOT
    # =========================================================

    feature_snapshot = models.JSONField(
        default=list,
        blank=True,
    )

    # =========================================================
    # QUANTITY
    # =========================================================

    quantity = models.DecimalField(
        max_digits=18,
        decimal_places=3,
        validators=[
            MinValueValidator(
                Decimal("0.001")
            ),
        ],
    )

    # =========================================================
    # PRICE SNAPSHOT
    # =========================================================

    unit_price = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0")
            ),
        ],
    )

    subtotal_price = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0")
            ),
        ],
    )

    # =========================================================
    # PRODUCT DISCOUNT SNAPSHOT
    # =========================================================

    product_discount_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0"),
        validators=[
            MinValueValidator(
                Decimal("0")
            ),
            MaxValueValidator(
                Decimal("100")
            ),
        ],
    )

    product_discount_amount = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal("0"),
        validators=[
            MinValueValidator(
                Decimal("0")
            ),
        ],
    )

    # =========================================================
    # FINAL PRICE
    # =========================================================

    final_unit_price = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0")
            ),
        ],
    )

    total_price = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0")
            ),
        ],
    )

    # =========================================================
    # INTERNAL FINANCIAL SNAPSHOT
    # =========================================================

    cost_price = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(
                Decimal("0")
            ),
        ],
    )

    # =========================================================
    # TIMESTAMP
    # =========================================================

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        db_table = "order_details"

        verbose_name = "Order Detail"

        verbose_name_plural = "Order Details"

        ordering = [
            "id",
        ]

        indexes = [
            models.Index(
                fields=[
                    "order",
                ],
                name="order_detail_order_idx",
            ),
            models.Index(
                fields=[
                    "product",
                ],
                name="order_detail_product_idx",
            ),
            models.Index(
                fields=[
                    "variant",
                ],
                name="order_detail_variant_idx",
            ),
        ]

    def __str__(self):
        return (
            f"{self.product_title} "
            f"× {self.quantity}"
        )