from django.db import models
from django.db.models import Count, Prefetch


class CategoryManager(models.Manager):

    def popular(self):
        return (
            self.get_queryset()
            .filter(
                status="published",
            )
            .annotate(
                product_count=Count(
                    "products",
                    distinct=True,
                ),
            )
            .order_by(
                "-product_count",
                "-created_at",
            )
        )

    def mega_menu(self):
        children_queryset = (
            self.model._base_manager
            .filter(
                status="published",
            )
            .order_by(
                "title",
            )
        )

        return (
            self.get_queryset()
            .filter(
                status="published",
                parent__isnull=True,
            )
            .prefetch_related(
                Prefetch(
                    "children",
                    queryset=children_queryset,
                ),
            )
            .order_by(
                "title",
            )
        )

    def products_by_slug(self, slug):
        return (
            self.get_queryset()
            .filter(
                status="published",
                slug=slug,
            )
            .prefetch_related(
                "products",
            )
            .first()
        )