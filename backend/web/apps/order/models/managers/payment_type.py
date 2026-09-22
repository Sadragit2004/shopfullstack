from django.db import models


class PaymentTypeManager(models.Manager):

    # =========================================================
    # Query helpers
    # =========================================================

    def active(self):
        return self.filter(
            is_active=True,
        ).order_by(
            "-created_at",
        )

    # =========================================================
    # Creation
    # =========================================================

    def create_payment_type(
        self,
        *,
        title,
        is_active=True,
    ):
        from ..services.payment_type import PaymentTypeService

        return PaymentTypeService.create(
            title=title,
            is_active=is_active,
        )

    # =========================================================
    # Order
    # =========================================================

    def set_order_payment_type(
        self,
        *,
        order_id,
        payment_type_id,
    ):
        from ..services.payment_type import PaymentTypeService

        return PaymentTypeService.set_order_payment_type(
            order_id=order_id,
            payment_type_id=payment_type_id,
        )