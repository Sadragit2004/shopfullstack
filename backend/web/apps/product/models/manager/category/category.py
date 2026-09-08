from django.db import models
from django.db.models import Prefetch


class CategoryManager(models.Manager):

    def popular(self):
        return (
            self.get_queryset()
            .filter(
                status="published",
            )
            .annotate(
                product_count=models.Count(
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
        """
        دریافت ساختار مگا منو تا حداکثر 5 سطح.
        """

        queryset = (
            self.get_queryset()
            .filter(
                status="published",
            )
            .order_by("title")
        )

        # Level 5
        level_5 = queryset

        # Level 4
        level_4 = queryset.prefetch_related(
            Prefetch(
                "children",
                queryset=level_5,
            )
        )

        # Level 3
        level_3 = queryset.prefetch_related(
            Prefetch(
                "children",
                queryset=level_4,
            )
        )

        # Level 2
        level_2 = queryset.prefetch_related(
            Prefetch(
                "children",
                queryset=level_3,
            )
        )

        # Level 1
        return (
            self.get_queryset()
            .filter(
                status="published",
                parent__isnull=True,
            )
            .prefetch_related(
                Prefetch(
                    "children",
                    queryset=level_2,
                )
            )
            .order_by("title")
        )
