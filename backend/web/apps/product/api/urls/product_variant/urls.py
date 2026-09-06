from django.urls import path

from apps.product.api.views.product_variant.views import (
    ProductVariantListCreateView,
    ProductVariantDetailView,
)


urlpatterns = [
    path(
        "product-variants/",
        ProductVariantListCreateView.as_view(),
        name="product-variant-list",
    ),
    path(
        "product-variants/<int:pk>/",
        ProductVariantDetailView.as_view(),
        name="product-variant-detail",
    ),
]