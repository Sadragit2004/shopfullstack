from django.urls import path

from apps.product.api.views.pricing_tier.views import (
    PricingTierListCreateView,
    PricingTierDetailView,
)


urlpatterns = [
    path(
        "pricing-tiers/",
        PricingTierListCreateView.as_view(),
        name="pricing-tier-list",
    ),
    path(
        "pricing-tiers/<int:pk>/",
        PricingTierDetailView.as_view(),
        name="pricing-tier-detail",
    ),
]