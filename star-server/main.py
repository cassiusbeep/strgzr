from skyfield.api import load
from skyfield.api import N, W, wgs84
from astropy import units as u
import sys

from flask import Flask, request

app = Flask(__name__)

@app.route('/calculate_distance', methods=['GET'])
def calculate_distance():
    longitude = float(request.args.get('longitude'))
    latitude = float(request.args.get('latitude'))
    planet_name = request.args.get('planet')

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

@app.route('/closest_planet', methods=['GET'])
def closest_planet():
    latitude = float(request.args.get('latitude'))
    longitude = float(request.args.get('longitude'))
    direction = float(request.args.get('direction'))
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
        if (az.degrees - direction < distance):
            closest_name = str(planet)
            closest_name = closest_name.split(" ")
            closest_name = closest_name[len(closest_name) - 1]

    result = {"name":closest_name}

    return result

if __name__ == '__main__':
    app.run(debug=False, host="0.0.0.0", port=7892)

