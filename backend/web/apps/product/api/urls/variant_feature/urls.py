from django.urls import path

from apps.product.api.views.variant_feature.views import (
    VariantFeatureListCreateView,
    VariantFeatureDetailView,
)


urlpatterns = [
    path(
        "variant-features/",
        VariantFeatureListCreateView.as_view(),
        name="variant-feature-list",
    ),
    path(
        "variant-features/<int:pk>/",
        VariantFeatureDetailView.as_view(),
        name="variant-feature-detail",
    ),
]