from rest_framework import serializers

from .models import Event


class EventSerializer(serializers.ModelSerializer):
    organizer = serializers.ReadOnlyField(source='organizer.username')

    class Meta:
        model = Event
        fields = [
            'id',
            'title',
            'description',
            'location',
            'start_time',
            'end_time',
            'organizer',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'organizer', 'created_at', 'updated_at']

    def validate(self, attrs):
        start = attrs.get('start_time', getattr(self.instance, 'start_time', None))
        end = attrs.get('end_time', getattr(self.instance, 'end_time', None))
        if start and end and end <= start:
            raise serializers.ValidationError(
                {'end_time': 'End time must be after the start time.'}
            )
        return attrs
