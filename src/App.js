import "./App.css";
import React, { Component } from "react";
import cities from "./utils/cities";
import { Button, Spinner, Card } from "react-bootstrap";

var moment = require("moment");
moment().format();

function convertToC(temp) {
  return (temp - 273.15).toFixed(2);
}
function convertToF(temp) {
  return (((temp - 273.15) * 9) / 5 + 32).toFixed(2);
}

export default class App extends Component {
  state = { isLoading: true };
  async getWeather(lat, long) {
    const APIKEY = "35a79293ad781730950573bad11e02c3";
    try {
      const response = await fetch(
        `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${APIKEY}`
      );
      const jsonData = await response.json();
      this.setState({
        city: jsonData.name,
        country: jsonData.sys.country,
        weather: jsonData.weather[0].description,
        tempC: convertToC(jsonData.main.temp),
        tempF: convertToF(jsonData.main.temp),
        id: jsonData.weather[0].id,
        isLoading: false
      });
    } catch (error) {
      alert("Get weather error: ", error);
    }
    this.forecast(lat, long);
  }

  async forecast(lat, long) {
    try {
      const response = await fetch(
        `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=35a79293ad781730950573bad11e02c3`
      );
      const jsonData = await response.json();
      this.setState({ forecasts: jsonData.list });
    } catch (error) {
      alert("Forecast error: ", error);
    }
  }

  componentDidMount = () => {
    navigator.geolocation.getCurrentPosition(async position => {
      const latitude = position.coords.latitude;
      const longtitude = position.coords.longitude;
      this.getWeather(latitude, longtitude);
      this.forecast(latitude, longtitude);
    });
  };

  render() {
    if (this.state.isLoading) {
      return (
        <div className="App-header">
          <Spinner animation="border" variant="light" />
        </div>
      );
    } else {
      return (
        <div
          className={`App bg-${
            this.state.id === 800 ? "clear" : Math.floor(this.state.id / 100)
          }`}
        >
          <div className="container current">
            <h1 className="mb-3">
              {this.state.city}, {this.state.country}
            </h1>
            <h2>
              {this.state.tempC} °C / {this.state.tempF} °F
            </h2>
            <h3 className="weather">{this.state.weather} </h3>

            {cities.map(city => {
              return (
                <Button
                  variant="info"
                  className="mx-1 my-3"
                  onClick={() => this.getWeather(city.lat, city.long)}
                >
                  {city.name}
                </Button>
              );
            })}
          </div>
          <h2 className="text-bolder text-white">24H FORECAST</h2>
          <ul>
            {this.state.forecasts &&
              this.state.forecasts.slice(0, 8).map(forecast => {
                return <Forecast forecast={forecast} />;
              })}
          </ul>
          <h5 className="text-white">
            Created with ❤️ by <a href="https://github.com/myquyen">Quyen</a>
          </h5>
        </div>
      );
    }
  }
}

class Forecast extends Component {
  render() {
    return (
      <Card className="col-3 p-0 m-2 transparent">
        <Card.Header>
          {moment(this.props.forecast.dt_txt)
            .add(7, "hour")
            .format("LLL")}
        </Card.Header>
        <Card.Body>
          <blockquote className="blockquote mb-0">
            <p style={{ fontWeight: "bold" }}>
              {convertToC(this.props.forecast.main.temp)} °C /{" "}
              {convertToF(this.props.forecast.main.temp)} °F
            </p>
            <p>Humidity: {this.props.forecast.main.humidity}%</p>
            <p className="weather">
              {this.props.forecast.weather[0].description}
            </p>
          </blockquote>
        </Card.Body>
      </Card>
    );
  }
}
