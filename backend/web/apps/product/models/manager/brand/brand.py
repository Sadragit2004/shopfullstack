from django.db import models
from django.db.models import Count


class BrandManager(models.Manager):

    def active_by_product_count(self):
        return (
            self.get_queryset()
            .filter(
                is_active=True,
            )
            .annotate(
                content_count=Count(
                    "products",
                    distinct=True,
                ),
            )
            .order_by(
                "-content_count",
                "-created_at",
            )
        )