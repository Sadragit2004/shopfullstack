from django.urls import path

from apps.product.api.views.product_feature.views import (
    ProductFeatureListCreateView,
    ProductFeatureDetailView,
)


urlpatterns = [
    path(
        "product-features/",
        ProductFeatureListCreateView.as_view(),
        name="product-feature-list",
    ),
    path(
        "product-features/<int:pk>/",
        ProductFeatureDetailView.as_view(),
        name="product-feature-detail",
    ),
]