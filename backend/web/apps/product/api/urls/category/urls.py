from django.urls import path

from apps.product.api.views.category.views import (
    CategoryListCreateView,
    CategoryDetailView,
)

from apps.product.api.views.category.public import (
    CategoryPopularView,
    CategoryMegaMenuView,

)

from apps.product.api.views.category.category_product_list import CategoryProductListView

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
        'categories/<slug:category_slug>/',
        CategoryProductListView.as_view(),
        name='category-products-filter'
    ),


]