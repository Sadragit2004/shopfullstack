# apps/product/api/urls.py
from django.urls import path

from apps.product.api.views.brand.views import (
    BrandListCreateView,
    BrandDetailView,
)

from apps.product.api.views.brand.public import (
    BrandPublicView,
)

# ============================================================
# ایمپورت ویوهای جدید برند
# ============================================================
from apps.product.api.views.brand.brand_detail import (
    BrandDetailView as BrandPublicDetailView,
)


urlpatterns = [
    # ============================================================
    # Brand URLs (ادمین)
    # ============================================================
    path("brands/", BrandListCreateView.as_view(), name="brand-list"),
    path("brands/<int:pk>/", BrandDetailView.as_view(), name="brand-detail"),
    path(
        "popular_brand/",
        BrandPublicView.as_view(),
        name="active-and-popular-brand",
    ),

    # ============================================================


    # جزئیات برند با محصولات و فیلتر دسته‌بندی
    path(
        "brand_detail/<slug:brand_slug>/",
        BrandPublicDetailView.as_view(),
        name="public-brand-detail"
    ),

    # ============================================================

]