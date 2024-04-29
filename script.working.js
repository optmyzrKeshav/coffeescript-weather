const API_KEY = "3edd04b4790e8483645f24667cd79d87";

async function loadCityList(){
  return fetch("./current.city.list.json").then((response) => response.json()).catch((error)=>{console.log("error fetching json: ",error)});
}

function populateSelection(data, selectId){
  const select = document.getElementById(selectId);

  data.forEach((city) => {
    const option = document.createElement("option");
    option.text = city.name;
    option.value = city.id;
    select.appendChild(option);
  });
}
async function main(){
  const data = await loadCityList();
  populateSelection(data.slice(1,10), "city-selector");
  // Decorate
  $("#city-selector").chosen();
}
main();

fetchDataButton = document.getElementById("fetchDataButton")
function fetchDataButtonHandler(){
  const selectElement = document.getElementById("city-selector");
  console.log("nextButton:", selectElement.value);
  if(selectElement.value){
    getWeatherDataForId(selectElement.value).then((data)=>{collectionObj.add(new WeatherItemDataModel(data));console.log(data)});
  }
}


function getWeatherDataForId(id) {
  return fetch(
    `https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${API_KEY}`
  )
  .then((response) => {
    return response.json();
  })
  .then((data) => { 
    console.log("next:",data);
      return {
        id: data.id,
        name: data.name,
        temperature: data.main.temp,
      };
    });
}

const unitSelectorButton = document.getElementById("unitSelectorButton");
let currentTempUnit = "K";
unitSelectorButton.addEventListener("click", function() {
  
  if (currentTempUnit === "K") {
    unitSelectorButton.textContent = "C";
    currentTempUnit="C"
  } else if (currentTempUnit === "C") {
    unitSelectorButton.textContent = "F";
    currentTempUnit = "F";
  } else if (currentTempUnit === "F") {
    unitSelectorButton.textContent = "K";
    currentTempUnit = "K";
  }
  newview.render();
});

const WeatherItemDataModel = Backbone.Model.extend({
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
    this.listenTo(this.collection, "add", this.render);
    this.listenTo(this.collection, "destroy", this.render); // Render when a model is destroyed
  },
  template: _.template($("#item-template").html()),
  
  render: function () {
    console.log("render");
    this.$el.empty();
    const self = this; // store reference to 'this' for later use
    this.collection.each((model) => {
      let temperature = model.get('temperature');
      // Convert temperature to the appropriate unit
      if (currentTempUnit === 'C') {
        temperature -= 273.15; // Convert from Kelvin to Celsius
      } else if (currentTempUnit === 'F') {
        temperature = (temperature - 273.15) * 9/5 + 32; // Convert from Kelvin to Fahrenheit
      }
      const itemHtml = self.template({ 
        id: model.get('id'), 
        name: model.get('name'), 
        temperature: temperature.toFixed(2), // Round to 2 decimal places
        unit: currentTempUnit 
      });
      self.$el.append(itemHtml);
    });
    return this;
},

  events:{
    "click .updateButton":"updateData",
    "click .deleteButton":"deleteWeatherItem"
  },
  updateData: function (event) {
    const itemId = $(event.currentTarget).data('id');
    const modelToUpdate = this.collection.get(itemId);
  
    getWeatherDataForId(itemId)
      .then((updatedData) => {
        modelToUpdate.set('temperature', updatedData.temperature);
        this.render();
      })
      .catch((error) => {
        console.error('Error updating weather data:', error);
      });
  },
  deleteWeatherItem: function (event) {
    console.log("deleting")
    const itemId = $(event.currentTarget).data('id');
    const modelToDelete = this.collection.get(itemId); 
    console.log(event.currentTarget);
    if (modelToDelete) {
      modelToDelete.destroy(); // Destroy the model
    }
    this.render()
  },
});


const modelObj = new WeatherItemDataModel();
const newview = new view({el:weatherList, collection: collectionObj});
newview.render();

Backbone.sync = function(method, model, success, error){
  success.success();
}


