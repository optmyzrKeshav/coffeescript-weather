const API_KEY = "3edd04b4790e8483645f24667cd79d87";

async function loadCityList(){
  return fetch("./current.city.list.json").then((response) => response.json()).catch((error)=>{console.log("error fetching json: ",error)});
}

function populateSelection(data, selectId){
  console.log(data);
  const select = document.getElementById(selectId);

  data.forEach((city) => {
    const option = document.createElement("option");
    option.text = city.name; // Assuming your JSON has a "name" field for each city
    option.value = city.id; // Assuming your JSON has an "id" field for each city
    select.appendChild(option);
  });
}
async function main(){
  const data = await loadCityList();
  populateSelection(data, "city-selector");
  // Decorate
  $("#city-selector").chosen();
}
main();

fetchDataButton = document.getElementById("fetchDataButton")
function fetchDataButtonHandler(){
  const selectElement = document.getElementById("city-selector");
  console.log(selectElement.value);
  if(selectElement.value){
    getWeatherDataForId(selectElement.value).then((data)=>{return {name:data.name, id:data.id, temperature:data.temp}}).then((data)=>{collectionObj.add(new WeatherItemDataModel(data))});

  }
}
let city_id = 2172797;

function getWeatherDataForId() {
  return fetch(
    `https://api.openweathermap.org/data/2.5/weather?id=${city_id}&appid=${API_KEY}`
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      return {
        id: data.id,
        name: data.name,
        temperature: data.main.temp,
      };
    });
}

getWeatherDataForId(city_id).then((obj) => {
  console.log(obj);
});


const WeatherItemDataModel = Backbone.Model.extend({
  initialize: function () {
    console.log("creating model");
  },
  defaults: {
    id: -1,
    name: "placeholder",
    temperature: -100,
  },
});

const WeatherItemCollection = Backbone.Collection.extend({
    model: WeatherItemDataModel,
});

const collectionObj = new WeatherItemCollection();
const obj = new WeatherItemDataModel({id:321, name:"keshav", temperature:89});
collectionObj.add(obj);

const view = Backbone.View.extend({
  initialize:function(){
    this.listenTo(this.model, "change", this.render);
    this.listenTo(this.model, "destroy", this.remove);
  },
  template: _.template($("#item-template").html()),
  render: function () {
    console.log("render");
    // this.$el.html("helloworld");
    this.$el.append(this.template({ name: this.model.id, temperature: this.model.temperature}));
    return this;
  },
  events:{
    "click .updateButton":"updateData",
    "click .deleteButton":"deleteWeatherItem"
  },
  updateData: function () {
    console.log("update ",this);
  },
  deleteWeatherItem: function () {
    this.model.destroy();
    // this.remove();
  },
});

const modelObj = new WeatherItemDataModel();
const newview = new view({el:weatherList, model:obj});
newview.render();

Backbone.sync = function(method, model, success, error){
    success.success();
}