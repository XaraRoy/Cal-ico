from flask import Flask, current_app, jsonify, request, Response, send_file
from datetime import datetime, timedelta
import calendar
import os
from deta import Deta
from bs4 import BeautifulSoup
import requests
import traceback
from config import COLLECTION_KEY, TEST_STRING

print(f'config.py says {TEST_STRING}', flush=True)

deta = Deta()
app = Flask(__name__)


def log(message):
    print(message, flush=True)

def cssLink(name):
    log('linking css: '+ name)
    return f'<link rel="stylesheet" type="text/css" href="static/css/{name}.css"> \n'

def jsLink(name):
    log('linking js: '+ name)
    return f'<script src="static/js/{name}.js"></script> \n'

def addDayValues(cal):
    log('adding day values to the calendar')
    soup = BeautifulSoup(cal)
    last_day_cell = soup.findAll('td', class_=lambda value: value and 'noday' not in value)
    lastDay = int(last_day_cell[-1].get_text())
    for i in range (1, lastDay + 1):
        cal = cal.replace(f'>{str(i)}</td>', f' dayvalue="{str(i)}">{str(i)}</td>' )
    return cal

def generate_recurring_dates(event_data):
    log('generating recurring dates')
    # Parse event date and recurrence end date
    event_date = datetime.strptime(event_data['eventDate'], '%Y-%m-%d')
    recurrence_end_date = datetime.strptime(event_data['selectedRecurrence']['endDate'], '%Y-%m-%d')
    # Initialize a list to store the recurring dates
    recurring_dates = []

    # Calculate dates based on recurrence type
    if event_data['selectedRecurrence']['type'] == 'Daily':
        interval = timedelta(days=1)
        while event_date <= recurrence_end_date:
            recurring_dates.append(event_date.strftime('%Y-%m-%d'))
            event_date += interval
    elif event_data['selectedRecurrence']['type'] == 'Weekly':
        interval = timedelta(days=1)
        selected_days = event_data['selectedRecurrence']['daysOfWeek']

        while event_date <= recurrence_end_date:
            if event_date.strftime('%A').lower() in selected_days:
                recurring_dates.append(event_date.strftime('%Y-%m-%d'))
            event_date += interval
    elif event_data['selectedRecurrence']['type'] == 'Monthly':
        day_of_month = int(event_data['selectedRecurrence']['dayOfMonth'])

        while event_date <= recurrence_end_date:
            # Calculate the next valid date for the specified day of the month
            next_month = event_date.month + 1
            next_year = event_date.year

            if next_month > 12:
                next_month = 1
                next_year += 1

            next_date = datetime(next_year, next_month, day_of_month)

            # Ensure the next date is within the recurrence end date
            if next_date <= recurrence_end_date:
                event_date = next_date
                recurring_dates.append(event_date.strftime('%Y-%m-%d'))
            else:
                break
    log(f' generated {str(len(recurring_dates))} dates')
    return recurring_dates

def submit_recurring_event(event_data):
    log('submitting the recurring events')
    for date in generate_recurring_dates(event_data):
        eventYear, eventMonth, eventDay = date.split('-')
        event_data['eventDate'] = date
        event_data['eventYear'] = eventYear
        event_data['eventMonth'] = eventMonth
        event_data['eventDay'] = eventDay
        event_data['eventType'] = 'reoccuring'
        events = deta.Base('events')
        events.put(event_data)

def getSpriteSheet(spritesheetname):
    log('checking status of a spritesheet: '+spritesheetname)
    deta = Deta()
    src = deta.Drive('src')
    response = src.get(spritesheetname+'.png')
    if response ==  None:
        log(spritesheetname + 'not available, getting from collection')

        collection = Deta(COLLECTION_KEY)
        collection_drive = collection.Drive('spritesheets')
        response =  collection_drive.get(spritesheetname+'.png')

        content = response.read()
        src.put((spritesheetname+'.png'), content)
        log(spritesheetname+" placed in src")

    



@app.route("/")
def root():
    print('"/" requested')
    try:

        # # Initialize the Node Backend
        # try:
        #     url = '/node/'

        #     response = requests.get(url)
        #     print(response.status_code)

        # except requests.exceptions.RequestException as e:
        #     print(f"Request error: {e}")


        getSpriteSheet('sleep_walk_blink_spritesheet')
        getSpriteSheet('flipped_sleep_walk_blink_spritesheet')
        getSpriteSheet('SettingsButton')

        html_cal = calendar.HTMLCalendar(firstweekday=0)
        now = datetime.now()
        year = now.year
        month = now.month


        meta = '''
        <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0">
        <link rel="shortcut icon" href="/get_favicon">
        <meta name="msapplication-TileColor" content="#ec8d96">
        <meta name="theme-color" content="#ec8d96">
        '''
        styles = cssLink('table') + cssLink('main') + cssLink('eventMenu') + cssLink('events') + cssLink('cat')
        head = '<head>' + '\n' + styles + '\n' + meta + '\n' + '</head>' + "\n"

        settingsButton = '''
            <img src="/setup/images/SettingsButton" alt="settings" id="settings-img">
            <div id="clock-menu" style="display: none;">
            <div id="clock-settings">
                <label for="clock-12-hour">12-Hour:</label>
                <input type="checkbox" id="clock-12-hour" checked>
                <label for="clock-24-hour">24-Hour:</label>
                <input type="checkbox" id="clock-24-hour">
            </div>
            </div>


        '''


        cat = '''
        <div>
        	<canvas id="myCanvas">	</canvas>

        </div>
        '''

        #TODO ADD CUSTOM/Yearly RECURRENCE
        eventMenu = '''
        <div id="eventContainer" style="display: none;">
            <div id="eventMenu" class="eventMenu" style="display: none;">
                <div id='DateContainer' class="eventContainterInputs">
                    <input type="date" id="eventDate"><br>
                </div>
                <div id='eventTime' class="eventContainterInputs">
                    <select id="hour" size="6">
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
                    <select id="minute"size="6">
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

                    <select id="ampm" size="2">
                        <option value="AM" style="height:50%">AM</option>
                        <option value="PM" style="height:50%">PM</option>
                    </select>
                </div>

                <div id='nameContainer' class="eventContainterInputs">
                    <input type="text" id="eventName" placeholder="Enter name"><br>
                </div>
                <div id='colorContainer' class="eventContainterInputs">
                    <label for="color-picker">Event Color:</label>
                    <input type="color" value="#5f9ea0" id="color-picker" />
                </div>
                <fieldset class="eventContainterInputs">
                <legend>Optional</legend>
                
                <div id='descriptionContainer' class="eventContainterInputs">
                    <textarea id="eventDescription" class="eventContainterInputs" placeholder="Enter description"></textarea><br>
                </div>
                
                <div id="notify-me-div" class="eventContainterInputs">
                    <label for="notification-frequency">Notify Me:</label>
                    <select id="notification-frequency" name="notification-frequency">
                        <option value="never">Never</option>
                        <option value="5">5 Minutes</option>
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
  
                <label for="recurrence-type">Recurrence Type:</label>
                <select id="recurrence-type" name="recurrence-type">
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
                
                <div id='recurrenceEndDateContainer' style="display: none" >
                    <label for="end-date">End Date:</label>
                    <input type="date" id="end-date" name="end-date">
                </div>   
                
                <div id="weekly-options" style="display: none;">
                    <div class='check-container' style="display: flex; flex-direction:row;">
                        <input type="checkbox" id="day-sunday" name="day-sunday" value="sunday">
                        <label for="day-sunday">Sunday</label>
                    </div>
                    <div class='check-container' style="display: flex; flex-direction:row;">
                        <input type="checkbox" id="day-monday" name="day-monday" value="monday">
                        <label for="day-monday">Monday</label>
                    </div>
                    <div class='check-container' style="display: flex; flex-direction:row;">
                        <input type="checkbox" id="day-tuesday" name="day-tuesday" value="tuesday">
                    <label for="day-tuesday">Tuesday</label>
                    </div>
                    <div class='check-container' style="display: flex; flex-direction:row;">
                        <input type="checkbox" id="day-wednesday" name="day-wednesday" value="wednesday">
                        <label for="day-wednesday">Wednesday</label>
                    </div>
                    <div class='check-container' style="display: flex; flex-direction:row;">
                        <input type="checkbox" id="day-thursday" name="day-thursday" value="thursday">
                        <label for="day-thursday">Thursday</label>
                    </div>
                    <div class='check-container' style="display: flex; flex-direction:row;">
                        <input type="checkbox" id="day-friday" name="day-friday" value="friday">
                        <label for="day-friday">Friday</label>
                    </div>
                    <div class='check-container' style="display: flex; flex-direction:row;">
                        <input type="checkbox" id="day-saturday" name="day-saturday" value="saturday">
                        <label for="day-saturday">Saturday</label>
                    </div>
                </div>
                
                <div id="monthly-options" style="display: none;">
                    <label for="day-of-month">Day of the Month:</label>
                    <input type="number" id="day-of-month" name="day-of-month" min="1" max="31">
                </div>

                </fieldset>



                <div id='buttonContainer' class="eventContainterInputs">
                    <button id="saveEvent">Save</button>
                    <button id="cancelEvent">Cancel</button>
                    <button id="deleteEvent" style="display: none;">Delete</button>

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
        
        body = '<body>'  + '\n' + settingsButton + addDayValues(cal) + '\n' + eventMenu + "\n" + cat + "\n" +'</body>'
        javascript = jsLink('settings') + jsLink('eventPopulate') + jsLink('monthSelect') + jsLink('today') + jsLink('notify') + jsLink('eventMenu') + jsLink('cat')
        html = head + body + javascript
        log('html constructed')
        return html
    except:
        return jsonify({'error': str(traceback.format_exc())}), 500

@app.route('/get_favicon')
def get_favicon():
    log('serving favicon')
    filename = './favicon.ico'
    return send_file(filename)

@app.route('/save_event', methods=['POST'])
def submit_form():
    log('submitting an event')
    try:
        eventData = request.json

        if eventData and all(field in eventData and eventData[field] != '' for field in ['eventName', 'eventDate', 'timeString']):
            timeparts =  eventData['timeString'].split(":")
            if len(timeparts[0]) != 2 or len(timeparts[1]) < 2 or len(timeparts[1]) > 5: 
                return jsonify({'success': False, 'error': 'Invalid time'}), 500
            events = deta.Base('events')
            events.put(eventData)
            if eventData['selectedRecurrence']:
                submit_recurring_event(eventData)
            return jsonify({'success': True}), 200
        else:
            return jsonify({'success': False, 'error': 'Invalid eventData'}), 500

    except:
        # log(str(traceback.format_exc()))
        return jsonify({'success': False, 'error': str(traceback.format_exc())}), 500


@app.route('/get_event_details', methods=['POST'])
def get_event():
    log('requesting an event')
    try:
        eventData = request.json
        eventKey = eventData['eventKey']
        # log(eventKey)
        eventTime = eventKey.split('-')[0]
        eventName = eventKey.split('-')[1]
        eventDay = eventKey.split('-')[2].zfill(2)
        eventMonth = eventKey.split('-')[3].zfill(2)
        # log(eventTime+eventName+eventDay+eventMonth)
        eventDB = deta.Base('events')
        eventResponse = eventDB.fetch({
            'timeString': eventTime,
            'eventName': eventName,
            'eventDay': eventDay,
            'eventMonth' : eventMonth,
        })
        event = eventResponse.items[0]
        return jsonify(event), 200
    except:
        error = str(traceback.format_exc())
        log(error)
        return jsonify({'success': False, 'error':error}), 500


@app.route('/delete_event', methods=['POST'])
def delete_event():
    try:
        log('updating an event')
        eventData = request.json
        key = eventData.pop('key')

        deta = Deta()
        events = deta.Base('events')

        events.delete(key)
        log('eventDeleted')
        return jsonify({'success': True}), 200
    except:
        log(str(traceback.format_exc()))
        return jsonify({'success': False}), 500



@app.route('/update_event', methods=['POST'])
def update_event():
    try:
        log('updating an event')
        events = deta.Base('events')
        eventData = request.json
        key = eventData.pop('key')
        if eventData['selectedRecurrence']:
            # TODO delete all matching events
            # TODO submit new recurring events
            pass
        events.update(eventData, key)
        print(eventData, flush=True)
        return jsonify({'success': True}), 200
    except:
        log(str(traceback.format_exc()))
        return jsonify({'success': False}), 500


@app.route('/setup/public_key')
def setup_vapid_key():
    log('serving the vapid key')
    try:
        db = deta.Base('setup')
        response = db.get('public-key')
        key = response['value']
        return jsonify(key)
    except:
        return jsonify({'error': str(traceback.format_exc())}), 500

@app.route('/setup/api_key')
def setup_api_key():
    log('serving the api key')
    try:
        api_key = os.environ.get('DETA_API_KEY')
        return jsonify(api_key)
    except:
        return jsonify({'error': str(traceback.format_exc())}), 500

@app.route('/setup/origin')
def setup_origin():
    log('serving the origin')
    try:
        origin = f"https://{os.getenv('DETA_SPACE_APP_HOSTNAME')}"
        return jsonify(origin), 200
    except:
        return jsonify({'error': str(traceback.format_exc())}), 500

@app.route('/setup/subscription', methods=['PUT'])
def store_subscription_info():
    log('storing the subscription submission')
    try:
        data = request.json
        db = deta.Base('setup')
        db.put(data, 'subscription')
        return jsonify({'message': 'Subscription data stored successfully'})
    except Exception as e:
        return jsonify({'error': str(traceback.format_exc())}), 500

@app.route('/setup/images/<image_name>/')
def download_img(image_name):
    log('serving an image: '+image_name)
    try:
        src = deta.Drive('src')
        res = src.get(f'{image_name}.png')
        image = Response(res.iter_chunks(1024), content_type="image/png")
        return image
    except:
        log(str(traceback.format_exc()))
        return jsonify({'error': str(traceback.format_exc())}), 500

@app.route('/events/<int:year>/<int:month>/<int:day>', methods=['GET'])
@app.route('/events/<int:year>/<int:month>', defaults={'day': None}, methods=['GET'])
def getMonthlyEvents(year, month, day):
    log('serving the months events')
    try:
        monthstring = str(month).zfill(2)
        events = deta.Base('events')
        if day != None:
            daystring = str(day).zfill(2)
            eventData = events.fetch({'eventDay':daystring, 'eventMonth':monthstring, 'eventYear':str(year)}).items
        else:

         eventData = events.fetch({'eventMonth':monthstring, 'eventYear':str(year)}).items
        return jsonify(eventData), 200
    except Exception as e:
        return jsonify({'error': str(e), 'traceback': traceback.format_exc(), 'success': False}), 500

@app.route('/cal/<year>/<month>',  methods=['GET'])
def updateTable(year, month):
    log('building the next/previous month calenedar html')
    try:
        html_cal = calendar.HTMLCalendar(firstweekday=0)
        cal = html_cal \
            .formatmonth(int(year), int(month)) \
            .replace('border="0"', 'id="calendarTable" border="1"')
        return addDayValues(cal)
    except:
        return jsonify({'error': str(traceback.format_exc())}), 500

@app.route('/service.js', methods=['GET'])
def sw():
    log('serving the service.js file')
    return current_app.send_static_file('service.js')