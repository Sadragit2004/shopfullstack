from django.urls import path

from apps.product.api.views.feature.views import (
    FeatureListCreateView,
    FeatureDetailView,
)


urlpatterns = [
    path(
        "features/",
        FeatureListCreateView.as_view(),
        name="feature-list",
    ),
    path(
        "features/<int:pk>/",
        FeatureDetailView.as_view(),
        name="feature-detail",
    ),
]