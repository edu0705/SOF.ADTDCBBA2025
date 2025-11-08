from rest_framework.routers import DefaultRouter
from .views import ClubViewSet

router = DefaultRouter()
router.register(r'clubs', ClubViewSet)

urlpatterns = router.urls