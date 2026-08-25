from rest_framework import serializers

from .models import RSVP, Event, Guest


class EventSerializer(serializers.ModelSerializer):
    organizer = serializers.ReadOnlyField(source='organizer.username')
    is_mine = serializers.SerializerMethodField()

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
            'is_mine',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'organizer', 'is_mine', 'created_at', 'updated_at']

    def get_is_mine(self, obj):
        request = self.context.get('request')
        return bool(request and request.user.is_authenticated and obj.organizer_id == request.user.id)

    def validate(self, attrs):
        start = attrs.get('start_time', getattr(self.instance, 'start_time', None))
        end = attrs.get('end_time', getattr(self.instance, 'end_time', None))
        if start and end and end <= start:
            raise serializers.ValidationError(
                {'end_time': 'End time must be after the start time.'}
            )
        return attrs


class RSVPSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = RSVP
        fields = ['id', 'event', 'user', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'event', 'user', 'created_at', 'updated_at']


class GuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guest
        fields = ['id', 'event', 'name', 'email', 'status', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'event', 'created_at', 'updated_at']

    def validate(self, attrs):
        event = self.context['event']
        email = attrs.get('email', getattr(self.instance, 'email', None))
        query = Guest.objects.filter(event=event, email__iexact=email)
        if self.instance:
            query = query.exclude(pk=self.instance.pk)
        if query.exists():
            raise serializers.ValidationError({'email': 'This guest is already on the list.'})
        return attrs
