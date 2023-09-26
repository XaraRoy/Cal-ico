from flask import Flask, request, jsonify
from deta import Deta
from datetime import datetime, timedelta
import requests
import os
import json

from pywebpush import WebPushException, webpush



deta = Deta()
eventDB = deta.Base("events") 

app = Flask(__name__)

@app.route('/get_events')
def get_notifications():

    events = eventDB.fetch().items # since fetch doesnt always work
    # we will need to filter out events that have the notify_at value in this  10 minute window
    return jsonify(events)


@app.route('/backend_test')
def backend_test():
    return jsonify('hello')


@app.route('/send_push', methods=['POST'])
def send_push():
    try:
        setupDB = deta.Base('setup')
        vapid_private_key = setupDB.get('private-key')['value']
        vapid_public_key = setupDB.get('public-key')['value']

        subscription_info = request.get_json()
        push_data = {
            "title": "New Notification",
            "body": "This is a push notification from your Flask app!"
        }

        # Calculate the expiration time for 1 hour from now
        expiration_time = datetime.now() + timedelta(hours=1)


        webpush(
            subscription_info,
            data=json.dumps(push_data),
            vapid_private_key=vapid_private_key,
            vapid_public_key=vapid_public_key,
            vapid_claims={
                "sub": "mailto:lux-ssj3@gmail.com",
                "exp": int(expiration_time.timestamp()),
                "aud":  "https://purrfect_planner-1-z2375828.deta.app/"
            }
        )

        return jsonify({'success': True})
    except WebPushException as e:
        return jsonify({'success': False, 'error': str(e)})


@app.route("/__space/v0/actions", methods=["POST"])
def handle_space_action():
    try:
        action_data = request.get_json()  # Get JSON data from the request
        event_id = action_data.get("event", {}).get("id")
        trigger = action_data.get("event", {}).get("trigger")

        if event_id == "check_calendar_event":
            # get_notifications()
            return jsonify(success=True, message="event update completed")
        elif event_id == "push_test":
            # send_push()
            return jsonify(success=True, message="message pushed")
        else:
            return jsonify(success=False, message="Unknown action ID")

    except Exception as e:
        return jsonify(success=False, message=str(e))


if __name__ == '__main__':
    app.run()