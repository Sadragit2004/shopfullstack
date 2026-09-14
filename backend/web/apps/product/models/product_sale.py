from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q


class ProductSale(models.Model):

    product = models.ForeignKey(
        "product.Product",
        on_delete=models.CASCADE,
        related_name="sales",
    )

    variant = models.ForeignKey(
        "product.ProductVariant",
        on_delete=models.CASCADE,
        related_name="sales",
        null=True,
        blank=True,
    )

    sale_type = models.ForeignKey(
        "product.SaleType",
        on_delete=models.PROTECT,
        related_name="product_sales",
    )

    unit = models.ForeignKey(
        "product.Unit",
        on_delete=models.PROTECT,
        related_name="product_sales",
    )

    purchase_price = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        null=True,
        blank=True,
    )

    selling_price = models.DecimalField(
        max_digits=18,
        decimal_places=2,
    )

    # ============================================================
    # پله خرید
    # ============================================================

    purchase_step = models.PositiveIntegerField(
        default=1,
        help_text=(
            "تعداد پله‌ای که کاربر می‌تواند خرید کند "
            "(مثلاً 2 یعنی 2، 4، 6، 8، ...)"
        ),
    )

    minimum_quantity = models.PositiveIntegerField(
        default=1,
    )

    maximum_quantity = models.PositiveIntegerField(
        null=True,
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
        db_table = "product_sales"

        verbose_name = "Product Sale"
        verbose_name_plural = "Product Sales"

        ordering = [
            "-created_at",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "product",
                    "variant",
                    "sale_type",
                    "unit",
                ],
                name="unique_product_sale",
            ),

            models.CheckConstraint(
                condition=Q(
                    minimum_quantity__gte=1,
                ),
                name="sale_minimum_quantity_gte_one",
            ),

            models.CheckConstraint(
                condition=(
                    Q(maximum_quantity__isnull=True)
                    | Q(maximum_quantity__gte=1)
                ),
                name="sale_maximum_quantity_gte_one",
            ),

            models.CheckConstraint(
                condition=(
                    Q(maximum_quantity__isnull=True)
                    | Q(
                        maximum_quantity__gte=models.F(
                            "minimum_quantity"
                        )
                    )
                ),
                name="sale_maximum_gte_minimum",
            ),

            models.CheckConstraint(
                condition=Q(
                    selling_price__gte=0,
                ),
                name="sale_selling_price_gte_zero",
            ),

            models.CheckConstraint(
                condition=(
                    Q(purchase_price__isnull=True)
                    | Q(purchase_price__gte=0)
                ),
                name="sale_purchase_price_gte_zero",
            ),

            models.CheckConstraint(
                condition=Q(
                    purchase_step__gte=1,
                ),
                name="sale_purchase_step_gte_one",
            ),
        ]

    # ============================================================
    # Validation
    # ============================================================

    def clean(self):
        super().clean()

        # --------------------------------------------------------
        # بررسی ارتباط Variant و Product
        # --------------------------------------------------------

        if self.variant_id and self.product_id:
            if self.variant.product_id != self.product_id:
                raise ValidationError(
                    "Selected variant does not belong to the selected product."
                )

        # --------------------------------------------------------
        # بررسی purchase_step
        # --------------------------------------------------------

        if self.purchase_step < 1:
            raise ValidationError(
                "Purchase step must be at least 1."
            )

        # --------------------------------------------------------
        # purchase_step نباید از maximum_quantity بیشتر باشد
        # --------------------------------------------------------

        if (
            self.maximum_quantity
            and self.purchase_step > self.maximum_quantity
        ):
            raise ValidationError(
                "Purchase step cannot be greater than maximum quantity."
            )

    # ============================================================
    # Availability
    # ============================================================

    @property
    def is_available(self):
        """
        مشخص می‌کند این ProductSale در حال حاضر قابل خرید است یا خیر.

        شرایط قابل خرید بودن:

        1. خود ProductSale فعال باشد.
        2. Inventory برای آن وجود داشته باشد.
        3. Inventory فعال باشد.
        4. موجودی بیشتر از صفر باشد.
        """

        if not self.is_active:
            return False

        try:
            inventory = self.inventory
        except Inventory.DoesNotExist:
            return False

        return (
            inventory.is_active
            and inventory.quantity > 0
        )

    # ============================================================
    # String
    # ============================================================

    def __str__(self):

        if self.product_id:
            product_title = self.product.title
        else:
            product_title = "بدون محصول"

        if self.sale_type_id:
            sale_type_name = self.sale_type.name
        else:
            sale_type_name = "بدون نوع فروش"

        return f"{product_title} - {sale_type_name}"