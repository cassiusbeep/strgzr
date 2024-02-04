from skyfield.api import load
from skyfield.api import N, W, wgs84
from astropy import units as u

from flask import Flask, request

app = Flask(__name__)

planets = load("de421.bsp")

@app.route('/calculate_distance', methods=['GET'])
def calculate_distance():
    longitude = float(request.args.get('longitude'))
    latitude = float(request.args.get('latitude'))

    ts = load.timescale()
    t = ts.now()

    earth, mars = planets["earth"], planets["mars"]

    astrometric = earth.at(t).observe(mars)

    boston = earth + wgs84.latlon(longitude * N, latitude * W)
    astrometric = boston.at(t).observe(mars)
    alt, az, d = astrometric.apparent().altaz()

    print(alt)
    print(az)

    xyz = astrometric.position.to(u.au)
    altitude = alt.to(u.deg)

    print(xyz)
    print("{0:0.03f}".format(altitude))

    result = f"Azimuth:{az}, Altitude:{altitude}"

    return result

@app.route('/closest_planet', methods=['GET'])
def closest_planet():
    longitude = float(request.args.get('longitude'))
    latitude = float(request.args.get('latitude'))

    ts = load.timescale()
    t = ts.now()

    earth, mars = planets["earth"], planets["mars"]

    astrometric = earth.at(t).observe(mars)
    boston = earth + wgs84.latlon(longitude * N, latitude * W)

    closest = None
    closest_name = None
    for planet in planets:
        astrometric = boston.at(t).observe(planet)
        alt, az, d = astrometric.apparent().altaz()
        if (az > closest):
            closest = az
            closest_name = planet
    result = f"{closest_name}"

    return result

if __name__ == '__main__':
    planets = [
        planets["venus"],
        planets["mars"],
        planets["jupiter BARYCENTER"],
        planets["saturn BARYCENTER"],
        planets["uranus BARYCENTER"],
        planets["neptune BARYCENTER"],
    ]
    app.run(debug=True)

