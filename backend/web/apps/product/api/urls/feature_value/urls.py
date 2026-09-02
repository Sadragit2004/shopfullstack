from django.urls import path

from apps.product.api.views.feature_value.views import (
    FeatureValueListCreateView,
    FeatureValueDetailView,
)

urlpatterns = [
    path(
        "feature-values/",
        FeatureValueListCreateView.as_view(),
        name="feature-value-list",
    ),
    path(
        "feature-values/<int:pk>/",
        FeatureValueDetailView.as_view(),
        name="feature-value-detail",
    ),
]