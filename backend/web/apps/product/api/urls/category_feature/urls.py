from django.urls import path

from apps.product.api.views.category_feature.views import (
    CategoryFeatureListCreateView,
    CategoryFeatureDetailView,
)


urlpatterns = [
    path(
        "category-features/",
        CategoryFeatureListCreateView.as_view(),
        name="category-feature-list",
    ),
    path(
        "category-features/<int:pk>/",
        CategoryFeatureDetailView.as_view(),
        name="category-feature-detail",
    ),
]