from django.urls import path

from apps.product.api.views.brand.views import (
    BrandListCreateView,
    BrandDetailView,
)

from apps.product.api.views.brand.public import (
    BrandPublicView,

)

urlpatterns = [
    path("brands/", BrandListCreateView.as_view(), name="brand-list"),
    path("brands/<int:pk>/", BrandDetailView.as_view(), name="brand-detail"),
    path(
            "popular_brand/",
            BrandPublicView.as_view(),
            name="active-and-popular-brand",
        ),
]