from skyfield.api import load
from skyfield.api import N, W, wgs84
from astropy import units as u
import sys
from flask_cors import CORS, cross_origin

from flask import Flask, request

app = Flask(__name__)

location_data = None
servo_data = None

cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"


@app.route("/get_data", methods=["GET"])
@cross_origin()
def get_data():
    global location_data
    if location_data is None:
        return "No data to send!", 500
    return {
        "longitude": location_data.longitude,
        "latitude": location_data.latitude,
        "heading": location_data.heading,
    }

app.route("/move_servos", methods=["POST"])
@cross_origin()
def move_servos():
    global servo_data
    servo_data = request.args.get("dirString")

app.route("/get_servo_data", methods=["GET"])
@cross_origin()
def get_servo_data():
    global servo_data
    return servo_data

@app.route("/calculate_distance", methods=["GET"])
@cross_origin()
def calculate_distance():
    longitude = float(request.args.get("longitude"))
    latitude = float(request.args.get("latitude"))
    planet_name = request.args.get("planet")
    heading = float(request.args.get("heading[magHeading]"))
    global location_data
    location_data = {
        "longitude": longitude,
        "latitude": latitude,
        "heading": heading,
    }

    ts = load.timescale()
    t = ts.now()
    planets = load("de421.bsp")
    earth, mars = planets["earth"], planets[planet_name]

    astrometric = earth.at(t).observe(mars)

    boston = earth + wgs84.latlon(longitude * N, latitude * W)
    astrometric = boston.at(t).observe(mars)
    alt, az, d = astrometric.apparent().altaz()

    print(alt)
    print(az)

    altitude = alt.to(u.deg)

    print("{0:0.03f}".format(altitude))

    result = {"Azimuth": float(az.degrees), "Altitude": float(altitude.value)}

    return result


@app.route("/closest_planet", methods=["GET"])
@cross_origin()
def closest_planet():
    latitude = float(request.args.get("latitude"))
    longitude = float(request.args.get("longitude"))
    direction = float(request.args.get("direction"))
    planets = load("de421.bsp")
    planets_visible = [
        planets["venus"],
        planets["mars"],
        planets["sun"],
        planets["mercury"],
        planets["moon"],
    ]
    ts = load.timescale()
    t = ts.now()
    
    earth = planets["earth"]

    boston = earth + wgs84.latlon(latitude * N, longitude * W)

    distance = sys.maxsize
    closest_name = None
    for planet in planets_visible:
        astrometric = boston.at(t).observe(planet)
        alt, az, d = astrometric.apparent().altaz()
        print(direction)
        print(az.degrees)
        if az.degrees - direction < distance:
            closest_name = str(planet)
            closest_name = closest_name.split(" ")
            closest_name = closest_name[len(closest_name) - 1]

    result = {"name": closest_name}
    return result


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=7892)
