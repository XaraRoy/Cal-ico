from flask import Flask, current_app
import calendar


app = Flask(__name__)

def cssLink(name):
    return f'<link rel="stylesheet" type="text/css" href="static/css/{name}.css"> \n'

def jsLink(name):
       return f'<script src="static/js/{name}.js"></script> \n'


@app.route("/")
def root():
    html_cal = calendar.HTMLCalendar(firstweekday=0)
    year = 2023
    month = 9

    styles = cssLink('table') + cssLink('main') + cssLink('eventMenu')
    head = '<head>' + '\n' + styles + '\n' + '</head>' + "\n"

    # permissionButton = '<button id="permission-btn" onclick="main()">Ask Permission</button>'

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
    '''

    cal = html_cal \
        .formatmonth(year, month) \
        .replace('border="0"', 'id="calendarTable" border="1"')
    body = '<body>' +'\n' + cal + '\n' + eventMenu + '\n' + '</body>' + "\n" #+ permissionButton +'\n'
    javascript = jsLink('monthSelect') + jsLink('today') + jsLink('eventMenu') + jsLink('notify')
    html = head + body + javascript
    return html


@app.route('/<year>/<month>',  methods=['GET'])
def updateTable(year, month):
    html_cal = calendar.HTMLCalendar(firstweekday=0)
    cal = html_cal \
        .formatmonth(int(year), int(month)) \
        .replace('border="0"', 'id="calendarTable" border="1"')
    return cal

@app.route('/service.js', methods=['GET'])
def sw():
    return current_app.send_static_file('service.js')