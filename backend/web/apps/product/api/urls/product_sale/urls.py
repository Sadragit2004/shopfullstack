from django.urls import path

from apps.product.api.views.product_sale.views import (
    ProductSaleListCreateView,
    ProductSaleDetailView,
)


urlpatterns = [
    path(
        "product-sales/",
        ProductSaleListCreateView.as_view(),
        name="product-sale-list",
    ),
    path(
        "product-sales/<int:pk>/",
        ProductSaleDetailView.as_view(),
        name="product-sale-detail",
    ),
]