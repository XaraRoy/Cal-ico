from flask import Flask, request, jsonify
from deta import Deta
from datetime import datetime, timedelta
import requests
import os
import json
import traceback
from pywebpush import WebPushException, webpush


print("logging hello world", flush=True)

deta = Deta()
eventDB = deta.Base("events") 

app = Flask(__name__)




@app.route('/send_push', methods=['PUT', 'GET'])
def send_push(jsonData):
    print("attempting to push a message", flush=True)

    try:
        setupDB = deta.Base('setup')
        items = setupDB.fetch().items


        vapid_private_key = items[0]['value']

        subscription = items[2]
        push_subscription = {
            "endpoint" : subscription['endpoint'],
            "keys": {
                "auth": subscription['keys']['auth'],
                "p256dh": subscription['keys']['p256dh']
            }
        }

        push_data = jsonData


        webpush(
            push_subscription,
            data=push_data,
            vapid_private_key=vapid_private_key,
            vapid_claims={
                "sub": "mailto:roy.xara@gmail.com",
            }
        )

        print("Notification Sent Successfully", flush=True)
        return jsonify({'success': True})
    except:
        print("Failed pushing Notifications", flush=True)
        return jsonify({'success': False, 'error': str(traceback.format_exc())})

@app.route('/get_notifications')
def get_notifications():
    print("attempting to get notifications", flush=True)
    try:
        now = datetime.now()
        current_Year = now.year
        current_Month = now.month
        current_Day = now.day
        current_hour = now.hour
        current_minute = now.minute
        current_5_min_window = (current_minute//5) * 5
        # Construct the formatted time string
        formatted_time = f"{current_Year}-{current_Month:02d}-{current_Day:02d} {current_hour:02d}:{current_5_min_window:02d}"
        events = deta.Base('events')
        possible_events = []

        for i in range (0, 4):
            response = events.fetch({'eventYear': str(current_Year), 'eventMonth': str(current_Month).zfill(2), 'eventDay':  str(current_Day + i).zfill(2)})
            possible_events.append(response.items)


        # Key to filter on
        key_to_filter = 'notificationFrequency'

        # Value to filter for
        value_to_match = 'never'

        # Filter the data based on the key and value
        filtered_data = [
            [item for item in sub_list if item.get(key_to_filter) != value_to_match]
            for sub_list in possible_events
        ]

        def notification_time(event):
            notification_frequency_minutes = int(event['notificationFrequency'])
            time_string = event['timeString']
            
            # Parse the event date in the correct format
            event_date = datetime.strptime(event['eventDate'], '%Y-%m-%d')
            
            # Parse the time from the time string
            time_obj = datetime.strptime(time_string, '%I:%M %p').time()
            
            # Set the time of the event_date to match the time from time_string
            event_date = event_date.replace(hour=time_obj.hour, minute=time_obj.minute)

            # Subtract the notification time in minutes
            notification_time = event_date  - timedelta(minutes=notification_frequency_minutes)

            
            formatted_notification_time = notification_time.strftime('%Y-%m-%d %I:%M')
            return formatted_notification_time
        
        def constructNotificationMessage(event):
            # Extract relevant information
            event_name = event['eventName']
            notification_frequency = int(event['notificationFrequency'])

            # Determine the appropriate time unit
            if notification_frequency < 60:
                time_unit = 'Minutes'
                notification_time = notification_frequency
            elif notification_frequency < 1440:
                time_unit = 'Hours'
                notification_time = notification_frequency / 60
            elif notification_frequency == 1440:
                time_unit = 'Day'
                notification_time = notification_frequency / 1440
            else:
                time_unit = 'Days'
                notification_time = notification_frequency / 1440

            # Construct the JSON structured message
            notification_message = {
                'title': event_name,
                'body': f'Happening in {str(int(notification_time))} {time_unit}'
            }

            # Convert the message to JSON format
            notification_json = json.dumps(notification_message)
            return notification_json

        notified = False
        for daysEvents in filtered_data:
            for event in daysEvents:
                notifyAt = notification_time(event)
                if notifyAt == formatted_time:
                    print("sending a notification", flush=True)
                    notified = True

                    send_push(constructNotificationMessage(event))

        if not notified:
            print("No Notification times matched", flush=True)


    except:
        print("Failed Getting Notifications", flush=True)
        return jsonify({'success': False, 'error': str(traceback.format_exc())}) 



@app.route("/__space/v0/actions", methods=["POST"])
def handle_space_action():
    print("recieved an action", flush=True)

    try:
        action_data = request.get_json()  # Get JSON data from the request
        event_id = action_data.get("event", {}).get("id")
        trigger = action_data.get("event", {}).get("trigger")
        print(f'eventID: {event_id}', flush=True)
        if event_id == "check_events":
            print("starting the check_calendar_event action", flush=True)

            get_notifications()
            return jsonify(success=True, message="event update completed")
        elif event_id == "push_test":
            print("starting the push_test action", flush=True)
            send_push(json.dumps({'title':'Test Notification', 'body':'Scheduled Test Message'}))
            print("starting the check_calendar_event action on the wrong route" , flush=True)
            get_notifications()

            return jsonify(success=True, message="message pushed")
        else:
            print("no action bound for this id", flush=True)
            return jsonify(success=False, message="Unknown action ID")

    except Exception as e:
        return jsonify(success=False, message=str(traceback.format_exc()))


if __name__ == '__main__':
    app.run()