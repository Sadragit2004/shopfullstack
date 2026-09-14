# apps/product/models/coupon.py

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q


class UserDiscountCoupon(models.Model):

    user = models.ForeignKey(
        "user.User",
        on_delete=models.CASCADE,
        related_name="discount_coupons",
    )

    code = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
    )

    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
    )

    expires_at = models.DateTimeField()

    is_active = models.BooleanField(
        default=True,
        db_index=True,
    )

    is_used = models.BooleanField(
        default=False,
        db_index=True,
    )

    used_at = models.DateTimeField(
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
        db_table = "user_discount_coupons"
        verbose_name = "User Discount Coupon"
        verbose_name_plural = "User Discount Coupons"
        ordering = ["-created_at"]

        constraints = [
            models.CheckConstraint(
                condition=Q(percentage__gt=0) & Q(percentage__lte=100),
                name="coupon_percentage_between_0_and_100",
            ),
        ]

    def clean(self):
        super().clean()

        if self.percentage <= 0 or self.percentage > 100:
            raise ValidationError(
                "Coupon percentage must be between 0 and 100."
            )

    def __str__(self):
        return f"{self.code} - {self.percentage}%"