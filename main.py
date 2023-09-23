from flask import Flask
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
    styles = cssLink('table') + cssLink('main')
    head = '<head>' + '\n' + styles + '\n' + '</head>' + "\n"
    cal = html_cal \
        .formatmonth(year, month) \
        .replace('border="0"', 'id="calendarTable" border="1"')
    body = '<body>' + '\n' + cal + '\n' + '</body>' + "\n"
    javascript = jsLink('monthSelect') + jsLink('today')
    html = head + body + javascript
    return html


@app.route('/<year>/<month>',  methods=['GET'])
def updateTable(year, month):
    html_cal = calendar.HTMLCalendar(firstweekday=0)
    cal = html_cal \
        .formatmonth(int(year), int(month)) \
        .replace('border="0"', 'id="calendarTable" border="1"')
    return cal