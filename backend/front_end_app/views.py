from django.shortcuts import render
from django.http import HttpResponse

def index(request):
    return render(request, 'front_end_app\index.html')


def capture(request):
    return render(request, 'front_end_app\capture.html')


def verify(request):
    return render(request, 'front_end_app\\verify.html')

def result(request):
    return render(request, 'front_end_app\\result.html')