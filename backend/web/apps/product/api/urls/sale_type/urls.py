from django.urls import path

from apps.product.api.views.sale_type.views import (
    SaleTypeListCreateView,
    SaleTypeDetailView,
)


urlpatterns = [
    path(
        "sale-types/",
        SaleTypeListCreateView.as_view(),
        name="sale-type-list",
    ),
    path(
        "sale-types/<int:pk>/",
        SaleTypeDetailView.as_view(),
        name="sale-type-detail",
    ),
]