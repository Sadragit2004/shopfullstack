from decimal import Decimal

from django.db import transaction

from ..logistics import Logistics
from ..order import Order


class LogisticsService:

    @staticmethod
    @transaction.atomic
    def create(
        *,
        type,
        title,
        price=Decimal("0"),
        is_active=True,
    ):
        return Logistics.objects.create(
            type=type,
            title=title,
            price=price,
            is_active=is_active,
        )

    @staticmethod
    def get_active(logistics_id):
        return (
            Logistics.objects
            .filter(
                id=logistics_id,
                is_active=True,
            )
            .first()
        )

    @staticmethod
    def get_active_list():
        return Logistics.objects.active()

    @staticmethod
    @transaction.atomic
    def set_order_logistics(
        *,
        order_id,
        logistics_id,
        user=None,
    ):
        # =====================================================
        # Lock only the Order row.
        #
        # نکته مهم:
        # select_related("logistics") اینجا نباید استفاده شود،
        # چون logistics می‌تواند NULL باشد و PostgreSQL اجازه
        # FOR UPDATE روی سمت nullable یک OUTER JOIN را نمی‌دهد.
        # =====================================================

        order_queryset = (
            Order.objects
            .select_for_update()
            .filter(
                id=order_id,
            )
        )

        # =====================================================
        # امنیت:
        # فقط مالک سفارش اجازه تغییر Logistics را دارد.
        # =====================================================

        if user is not None:
            order_queryset = order_queryset.filter(
                user=user,
            )

        order = order_queryset.first()

        if not order:
            return None

        # =====================================================
        # Logistics را جداگانه پیدا می‌کنیم.
        #
        # انتخاب بر اساس ID است، نه type.
        # بنابراین چند Logistics با type یکسان
        # هیچ مشکلی ایجاد نمی‌کنند.
        # =====================================================

        logistics = (
            Logistics.objects
            .filter(
                id=logistics_id,
                is_active=True,
            )
            .first()
        )

        if not logistics:
            return None

        # =====================================================
        # Assign
        # =====================================================

        order.logistics = logistics

        order.save(
            update_fields=[
                "logistics",
            ],
        )

        # =====================================================
        # بعد از ذخیره، رابطه در حافظه هم مقداردهی شده است.
        # بنابراین View می‌تواند order.logistics را استفاده کند.
        # =====================================================

        return order