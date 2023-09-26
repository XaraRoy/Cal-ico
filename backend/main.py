from flask import Flask, request, jsonify
from deta import Deta
from datetime import datetime, timedelta
import requests
import os
import json
import traceback

from pywebpush import WebPushException, webpush



deta = Deta()
eventDB = deta.Base("events") 

app = Flask(__name__)

@app.route('/get_events')
def get_notifications():

    events = eventDB.fetch().items # since fetch doesnt always work
    # we will need to filter out events that have the notify_at value in this  10 minute window
    return jsonify(events)



@app.route('/send_push', methods=['PUT', 'GET'])
def send_push(jsonData):
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

        return jsonify({'success': True})
    except WebPushException as e:
        return jsonify({'success': False, 'error': str(traceback.format_exc())})


@app.route("/__space/v0/actions", methods=["POST"])
def handle_space_action():
    try:
        action_data = request.get_json()  # Get JSON data from the request
        event_id = action_data.get("event", {}).get("id")
        trigger = action_data.get("event", {}).get("trigger")

        if event_id == "check_calendar_event":
            get_notifications()
            return jsonify(success=True, message="event update completed")
        elif event_id == "push_test":
            send_push(json.dumps({'title':'Test Notification', 'body':'Scheduled Test Message'}))
            return jsonify(success=True, message="message pushed")
        else:
            return jsonify(success=False, message="Unknown action ID")

    except Exception as e:
        return jsonify(success=False, message=str(traceback.format_exc()))


if __name__ == '__main__':
    app.run()