from django.urls import path

from apps.product.api.views.category.views import (
    CategoryListCreateView,
    CategoryDetailView,
)


urlpatterns = [
    path(
        "categories/",
        CategoryListCreateView.as_view(),
        name="category-list",
    ),
    path(
        "categories/<int:pk>/",
        CategoryDetailView.as_view(),
        name="category-detail",
    ),
]