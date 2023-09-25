from flask import Flask, request, jsonify
from deta import Deta
from datetime import datetime, timedelta

deta = Deta()
app = Flask(__name__)
eventDB = deta.Base("events") 

def get_notifications():

    events = eventDB.fetch().items # since fetch doesnt always work
    # we will need to filter out events that have the notify_at value in this  10 minute window
    return jsonify(events)

@app.route("/__space/v0/actions", methods=["POST"])
def handle_space_action():
    try:
        action_data = request.get_json()  # Get JSON data from the request
        event_id = action_data.get("event", {}).get("id")
        trigger = action_data.get("event", {}).get("trigger")

        if event_id == "check_calendar_event":
            get_notifications()
            return jsonify(success=True, message="event update completed")
        else:
            return jsonify(success=False, message="Unknown action ID")

    except Exception as e:
        return jsonify(success=False, message=str(e))




if __name__ == '__main__':
    app.run()
