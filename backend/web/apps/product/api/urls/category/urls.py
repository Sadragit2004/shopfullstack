from django.urls import path

from apps.product.api.views.category.views import (
    CategoryListCreateView,
    CategoryDetailView,
)

from apps.product.api.views.category.public import (
    CategoryPopularView,
    CategoryMegaMenuView,
    CategoryProductsView,
)


urlpatterns = [
    # ============================================================
    # CRUD
    # ============================================================

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

    # ============================================================
    # Public
    # ============================================================

    path(
        "categories/popular/",
        CategoryPopularView.as_view(),
        name="category-popular",
    ),

    path(
        "categories/mega-menu/",
        CategoryMegaMenuView.as_view(),
        name="category-mega-menu",
    ),

    path(
        "categories/products/",
        CategoryProductsView.as_view(),
        name="category-products",
    ),
]