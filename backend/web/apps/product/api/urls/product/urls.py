from django.urls import path

from apps.product.api.views.product.views import (
    ProductListCreateView,
    ProductDetailView,
)


urlpatterns = [
    path(
        "products/",
        ProductListCreateView.as_view(),
        name="product-list",
    ),
    path(
        "products/<int:pk>/",
        ProductDetailView.as_view(),
        name="product-detail",
    ),
]