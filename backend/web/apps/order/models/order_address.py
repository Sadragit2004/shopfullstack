from django.db import models


class OrderAddress(models.Model):

    order = models.OneToOneField(
        "order.Order",
        on_delete=models.CASCADE,
        related_name="address",
    )

    user_address = models.ForeignKey(
        "user.UserAddress",
        on_delete=models.PROTECT,
        related_name="order_addresses",
        db_index=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        db_table = "order_addresses"

        verbose_name = "Order Address"
        verbose_name_plural = "Order Addresses"

        ordering = [
            "-created_at",
        ]

        indexes = [
            models.Index(
                fields=["user_address"],
                name="order_addr_user_addr_idx",
            ),
        ]

    def __str__(self):
        return f"Order #{self.order_id} - Address #{self.user_address_id}"