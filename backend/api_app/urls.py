from django.urls import path
from api_app.views import Predict, KeyView

urlpatterns = [
    path('predict', Predict.as_view(), name='image_upload'),
    path('key', KeyView.as_view(), name='key')
]
