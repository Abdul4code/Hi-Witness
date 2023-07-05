from rest_framework import serializers

class StringSerializer(serializers.Serializer):
    meta = serializers.CharField(required=True)
    report = serializers.CharField(required=True)
