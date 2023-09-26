from flask import Flask, current_app, jsonify, request, Response
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
    petHouse =  '''<img src="/setup/images/house_tiny" alt="pets" id='pethouse'> \n'''


    #TODO ADD CUSTOM RECURRENCE
    eventMenu = '''
    <div id="eventContainer">
        <div id="eventMenu" class="eventMenu" style="display: block;">
            <div id='DateContainer' class="eventContainterInputs">
                <input type="text" id="eventDate" placeholder="Enter date"><br>
            </div>
            <div id='eventTime' class="eventContainterInputs">
                <select id="hour">
                    <option value="01">01</option>
                    <option value="02">02</option>
                    <option value="03">03</option>
                    <option value="04">04</option>
                    <option value="05">05</option>
                    <option value="06">06</option>
                    <option value="07">07</option>
                    <option value="08">08</option>
                    <option value="09">09</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                </select>

                <label for="minute">:</label>
                <select id="minute">
                    <option value="00">00</option>
                    <option value="05">05</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                    <option value="25">25</option>
                    <option value="30">30</option>
                    <option value="35">35</option>
                    <option value="40">40</option>
                    <option value="45">45</option>
                    <option value="50">50</option>    
                    <option value="55">55</option>    

                </select>

                <select id="ampm">
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                </select>
            </div>

            <div id='nameContainer' class="eventContainterInputs">
                <input type="text" id="eventName" placeholder="Enter name"><br>
            </div>
            <div id='descriptionContainer' class="eventContainterInputs">
                <textarea id="eventDescription" class="eventContainterInputs" placeholder="Enter description"></textarea><br>
            </div>
            <fieldset class="eventContainterInputs">
            <legend>Recurrence</legend>
            
            <label for="recurrence-type">Recurrence Type:</label>
            <select id="recurrence-type" name="recurrence-type">
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
            </select>
            
            
            <div id="weekly-options" style="display: none;">
                <input type="checkbox" id="day-sunday" name="day-sunday" value="Sunday">
                <label for="day-sunday">Sunday</label>
                <input type="checkbox" id="day-monday" name="day-monday" value="Monday">
                <label for="day-monday">Monday</label>
                <input type="checkbox" id="day-tuesday" name="day-tuesday" value="tueday">
                <label for="day-tuesday">Tuesday</label>
                <input type="checkbox" id="day-wednesday" name="day-wednesday" value="wednesday">
                <label for="day-wednesday">Wednesday</label>
                <input type="checkbox" id="day-thursday" name="day-thursday" value="thursday">
                <label for="day-thursday">Thursday</label>
                <input type="checkbox" id="day-friday" name="day-friday" value="friday">
                <label for="day-friday">Friday</label>
                <input type="checkbox" id="day-saturday" name="day-saturday" value="saturday">
                <label for="day-saturday">Saturday</label>

            </div>
            
            <div id="monthly-options" style="display: none;">
                <label for="day-of-month">Day of the Month:</label>
                <input type="number" id="day-of-month" name="day-of-month" min="1" max="31">
            </div>
            </fieldset>
            <div id="notify-me-div" class="eventContainterInputs">
            <label for="notification-frequency">Notify Me:</label>
            <select id="notification-frequency" name="notification-frequency">
                <option value="never">Never</option>
                <option value="10">10 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="180">3 Hours</option>
                <option value="360">6 Hours</option>
                <option value="720">12 Hours</option>
                <option value="1440">1 Day</option>
                <option value="2880">2 Days</option>
                <option value="4320">3 Days</option>
            </select>
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
    
    body = '<body>'  + '\n' + cal + '\n' + eventMenu + "\n" + petHouse + '\n' + '</body>' #+ permissionButton +'\n' +'\n' + push_demo
    javascript = jsLink('monthSelect') + jsLink('today') + jsLink('notify') + jsLink('eventMenu')
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


@app.route('/setup/images/<image_name>/')
def download_img(image_name):
    try:
        src = deta.Drive('src')
        res = src.get(f'{image_name}.png')
        image = Response(res.iter_chunks(1024), content_type="image/png")
        return image
    except:
        return f'{image_name}.png not found'



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