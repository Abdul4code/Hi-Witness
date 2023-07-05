from django.urls import path
from api_app.views import Predict, KeyView, Verify_news

urlpatterns = [
    path('predict', Predict.as_view(), name='image_upload'),
    path('key', KeyView.as_view(), name='key'),
    path('compare', Verify_news.as_view(), name='compare')
]
