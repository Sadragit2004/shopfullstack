from .order_detail import (
    OrderView,
    OrderDetailListView,
    OrderDetailView,
)

from .order_status import (
    OrderStatusListCreateView,
    OrderStatusDetailView,
)

from .logistics import (
    LogisticsListCreateView,
    LogisticsDetailView,
)

from .payment_type import (
    PaymentTypeListCreateView,
    PaymentTypeDetailView,
)

from .order_discount import (
    OrderDiscountListCreateView,
    OrderDiscountDetailView,
)

from .order_coupon import (
    OrderCouponListCreateView,
    OrderCouponDetailView,
)


__all__ = [
    "OrderView",
    "OrderDetailListView",
    "OrderDetailView",

    "OrderStatusListCreateView",
    "OrderStatusDetailView",

    "LogisticsListCreateView",
    "LogisticsDetailView",

    "PaymentTypeListCreateView",
    "PaymentTypeDetailView",

    "OrderDiscountListCreateView",
    "OrderDiscountDetailView",

    "OrderCouponListCreateView",
    "OrderCouponDetailView",
]