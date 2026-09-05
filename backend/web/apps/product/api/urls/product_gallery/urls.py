from django.urls import path

from apps.product.api.views.product_gallery.views import (
    ProductGalleryListCreateView,
    ProductGalleryDetailView,
)


urlpatterns = [
    path(
        "product-galleries/",
        ProductGalleryListCreateView.as_view(),
        name="product-gallery-list",
    ),
    path(
        "product-galleries/<int:pk>/",
        ProductGalleryDetailView.as_view(),
        name="product-gallery-detail",
    ),
]