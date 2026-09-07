from django.urls import path

from apps.product.api.views.product.views import (
    ProductListCreateView,
    ProductDetailView,
)

from apps.product.api.views.product.public import (
    ProductDetailView,
)


urlpatterns = [
    # ============================================================
    # CRUD
    # ============================================================

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

    # ============================================================
    # Public
    # ============================================================

    path(
        "products/detail/",
        ProductDetailView.as_view(),
        name="product-public-detail",
    ),
]