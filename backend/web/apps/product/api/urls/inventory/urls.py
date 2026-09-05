from django.urls import path

from apps.product.api.views.inventory.views import (
    InventoryListCreateView,
    InventoryDetailView,
)


urlpatterns = [
    path(
        "inventories/",
        InventoryListCreateView.as_view(),
        name="inventory-list",
    ),
    path(
        "inventories/<int:pk>/",
        InventoryDetailView.as_view(),
        name="inventory-detail",
    ),
]