from django.urls import path

from apps.product.api.views.unit.views import (
    UnitListCreateView,
    UnitDetailView,
)


urlpatterns = [
    path(
        "units/",
        UnitListCreateView.as_view(),
        name="unit-list",
    ),
    path(
        "units/<int:pk>/",
        UnitDetailView.as_view(),
        name="unit-detail",
    ),
]