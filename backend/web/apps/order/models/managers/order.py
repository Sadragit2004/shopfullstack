from django.db import models


class OrderManager(models.Manager):

    # =========================================================
    # Query helpers
    # =========================================================

    def for_user(self, user):
        return self.filter(
            user=user,
        )

    def active(self):
        return self.exclude(
            status__code__in=[
                "cancelled",
                "returned",
            ],
        )

    def get_by_uuid(self, uuid):
        return self.filter(
            uuid=uuid,
        ).first()

    # =========================================================
    # Logistics
    # =========================================================

    def set_logistics(
        self,
        *,
        order_id,
        type,
    ):
        from ..services.logistics import LogisticsService

        return LogisticsService.set_order_logistics(
            order_id=order_id,
            type=type,
        )

    # =========================================================
    # Creation
    # =========================================================

    def create_order(
        self,
        *,
        user,
        status,
        logistics,
        payment_type,
        **kwargs,
    ):
        from ..services.order import OrderService

        return OrderService.create_order(
            user=user,
            status=status,
            logistics=logistics,
            payment_type=payment_type,
            **kwargs,
        )

    # =========================================================
    # Payment
    # =========================================================

    def payable(self):
        return (
            self.exclude(
                status__code__in=[
                    "paid",
                    "cancelled",
                    "returned",
                ]
            )
            .filter(
                total_price__gt=0,
            )
        )

    def get_payable_by_id(self, order_id, user=None):
        qs = self.payable().filter(
            id=order_id,
        )

        if user:
            qs = qs.filter(
                user=user,
            )

        return qs.first()

    def has_pending_payment(self, order):
        from apps.peyment.models import Peyment

        return Peyment.objects.filter(
            order=order,
            status=Peyment.PeymentStatus.PENDING,
        ).exists()

    def has_paid_payment(self, order):
        from apps.peyment.models import Peyment

        return Peyment.objects.filter(
            order=order,
            status=Peyment.PeymentStatus.ACCEPTED,
        ).exists()