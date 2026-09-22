from django.urls import path

from ..views.public.createorder import (
    CreateOrderView,
)

from ..views.public.logistics import (
    LogisticsListView,
    OrderLogisticsView,
)

from ..views.public.payment_types import (
    PaymentTypeListView,
    OrderPaymentTypeView,
)

from ..views.public.coupons import (
    CouponValidateView,
)

from ..views.public.order_address import (
    OrderAddressView,
)

from ..views.crud.order_detail import (
    OrderView,
)


urlpatterns = [

    # ========================================================
    # CREATE
    # ========================================================

    path(
        "create/",
        CreateOrderView.as_view(),
        name="order-create",
    ),

    # ========================================================
    # ORDER
    # ========================================================

    path(
        "<int:order_id>/",
        OrderView.as_view(),
        name="order-detail",
    ),

    # ========================================================
    # LOGISTICS
    # ========================================================

    path(
        "logistics/",
        LogisticsListView.as_view(),
        name="logistics-list",
    ),

    path(
        "<int:order_id>/logistics/",
        OrderLogisticsView.as_view(),
        name="order-logistics",
    ),

    # ========================================================
    # PAYMENT TYPES
    # ========================================================

    path(
        "payment-types/",
        PaymentTypeListView.as_view(),
        name="payment-type-list",
    ),

    path(
        "<int:order_id>/payment-type/",
        OrderPaymentTypeView.as_view(),
        name="order-payment-type",
    ),

    # ========================================================
    # COUPONS
    # ========================================================

    path(
        "coupons/validate/",
        CouponValidateView.as_view(),
        name="coupon-validate",
    ),

    # ========================================================
    # ADDRESS
    # ========================================================

    path(
        "<int:order_id>/address/",
        OrderAddressView.as_view(),
        name="order-address",
    ),
]