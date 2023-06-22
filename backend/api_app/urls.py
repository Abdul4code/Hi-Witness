from django.urls import path
from api_app.views import ImageUploadView

urlpatterns = [
    path('upload/', ImageUploadView.as_view(), name='image_upload'),
]
