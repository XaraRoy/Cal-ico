from flask import Flask, current_app, jsonify, request
import calendar
import os
from deta import Deta
import requests
import traceback

deta = Deta()


app = Flask(__name__)

def cssLink(name):
    return f'<link rel="stylesheet" type="text/css" href="static/css/{name}.css"> \n'

def jsLink(name):
       return f'<script src="static/js/{name}.js"></script> \n'




@app.route("/")
def root():


    url = '/node/'

    try:
        response = requests.get(url)
        print(response.status_code)

    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")



    html_cal = calendar.HTMLCalendar(firstweekday=0)
    year = 2023
    month = 9

    styles = cssLink('table') + cssLink('main') + cssLink('eventMenu')
    head = '<head>' + '\n' + styles + '\n' + '</head>' + "\n"

    # permissionButton = '<button id="permission-btn" onclick="main()">Ask Permission</button>'
    # push_demo = '''
    #     <form>
    #     Notification delay: <input id='notification-delay' type='number' value='5'></input> seconds
    #     Notification Time-To-Live: <input id='notification-ttl' type='number' value='0'></input> seconds
    #     </form>
    #     <button id="doIt">Try to conquer Italy!</button>

    # '''



    eventMenu = '''
    <div id="eventContainer">
        <div id="eventMenu" class="eventMenu" style="display: none;">
            <div id='DateContainer' class="eventContainterInputs">
                <input type="text" id="eventDate" placeholder="Enter date"><br>
            </div>
            <div id='timeContainer' class="eventContainterInputs">
                <input type="text" id="eventTime" placeholder="Enter time"><br>
            </div>
            <div id='nameContainer' class="eventContainterInputs">
                <input type="text" id="eventName" placeholder="Enter name"><br>
            </div>
            <div id='descriptionContainer' class="eventContainterInputs">
                <textarea id="eventDescription" placeholder="Enter description"></textarea><br>
            </div>
            <div id='buttonContainer' class="eventContainterInputs">
                <button id="saveEvent">Save</button>
                <button id="cancelEvent">Cancel</button>
            </div>
        </div>
    </div>
    '''


    notificationHelp = '''
        <div id="notificationHelp">
        <p>
        For Windows, Make sure you have allowed notifications from Chrome/Edge/FireFox
        You may have to click into the browser setting and specificly enable banners
        You may have to change your focus assist settings by clicking in the bottom right of your taskbar to allow the notifications.
        For OSX, support for notifications is only available for macOS 13 and later
        </p>
        </div>
    '''


    cal = html_cal \
        .formatmonth(year, month) \
        .replace('border="0"', 'id="calendarTable" border="1"')
    body = '<body>'  + '\n' + cal + '\n' + eventMenu + '\n' + '</body>' + "\n" #+ permissionButton +'\n' +'\n' + push_demo
    javascript = jsLink('monthSelect') + jsLink('today') + jsLink('eventMenu') + jsLink('notify')
    html = head + body + javascript
    return html


@app.route('/setup/public_key')
def setup_vapid_key():
    db = deta.Base('setup')
    response = db.get('public-key')
    key = response['value']
    return jsonify(key)

@app.route('/setup/api_key')
def setup_api_key():
    api_key = os.environ.get('DETA_API_KEY')
    return jsonify(api_key)

@app.route('/setup/origin')
def setup_origin():
    origin = f"https://{os.getenv('DETA_SPACE_APP_HOSTNAME')}"
    return jsonify(origin)

@app.route('/setup/subscription', methods=['PUT'])
def store_subscription_info():
    try:
        data = request.json
        db = deta.Base('setup')
        db.put(data, 'subscription')
        return jsonify({'message': 'Subscription data stored successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(traceback.format_exc())}), 500


@app.route('/cal/<year>/<month>',  methods=['GET'])
def updateTable(year, month):
    html_cal = calendar.HTMLCalendar(firstweekday=0)
    cal = html_cal \
        .formatmonth(int(year), int(month)) \
        .replace('border="0"', 'id="calendarTable" border="1"')
    return cal

@app.route('/service.js', methods=['GET'])
def sw():
    return current_app.send_static_file('service.js')