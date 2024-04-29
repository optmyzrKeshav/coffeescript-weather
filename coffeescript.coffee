API_KEY = "3edd04b4790e8483645f24667cd79d87"

loadCityList = ->
  fetch("./current.city.list.json")
    .then((response) -> response.json())
    .catch((error) -> console.log("error fetching json: ", error))

populateSelection = (data, selectId) ->
  select = document.getElementById(selectId)
  data.forEach (city) ->
    option = document.createElement("option")
    option.text = city.name
    option.value = city.id
    select.appendChild(option)

main = async () ->
  data = await loadCityList()
  populateSelection(data.slice(1,10), "city-selector")
  $("#city-selector").chosen()

main()

fetchDataButton = document.getElementById("fetchDataButton")
fetchDataButtonHandler = () ->
  selectElement = document.getElementById("city-selector")
  console.log("nextButton:", selectElement.value)
  if selectElement.value
    getWeatherDataForId(selectElement.value).then((data) -> 
      collectionObj.add(new WeatherItemDataModel(data))
      console.log(data)
    )

getWeatherDataForId = (id) ->
  fetch(`https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${API_KEY}`)
    .then((response) -> response.json())
    .then((data) -> 
      console.log("next:",data)
      return {
        id: data.id
        name: data.name
        temperature: data.main.temp
      }
    )

unitSelectorButton = document.getElementById("unitSelectorButton")
currentTempUnit = "K"
unitSelectorButton.addEventListener "click", ->
  if currentTempUnit is "K"
    unitSelectorButton.textContent = "C"
    currentTempUnit = "C"
  else if currentTempUnit is "C"
    unitSelectorButton.textContent = "F"
    currentTempUnit = "F"
  else if currentTempUnit is "F"
    unitSelectorButton.textContent = "K"
    currentTempUnit = "K"
  newview.render()

WeatherItemDataModel = Backbone.Model.extend
  defaults: 
    id: -1
    name: "placeholder"
    temperature: -100

WeatherItemCollection = Backbone.Collection.extend
  model: WeatherItemDataModel

collectionObj = new WeatherItemCollection()
obj = new WeatherItemDataModel(id: 321, name: "keshav", temperature: 89)
collectionObj.add(obj)

view = Backbone.View.extend
  initialize: ->
    @listenTo @collection, "add", @render
    @listenTo @collection, "destroy", @render
  template: _.template($("#item-template").html())
  render: ->
    console.log("render")
    @el.empty()
    self = @
    @collection.each (model) =>
      temperature = model.get('temperature')
      if currentTempUnit is 'C'
        temperature -= 273.15
      else if currentTempUnit is 'F'
        temperature = (temperature - 273.15) * 9/5 + 32
      itemHtml = self.template
        id: model.get('id')
        name: model.get('name')
        temperature: temperature.toFixed(2)
        unit: currentTempUnit
      @el.append(itemHtml)
    return this
  events:
    "click .updateButton": "updateData"
    "click .deleteButton": "deleteWeatherItem"
  updateData: (event) ->
    itemId = $(event.currentTarget).data('id')
    modelToUpdate = @collection.get(itemId)
    getWeatherDataForId(itemId)
      .then((updatedData) => 
        modelToUpdate.set('temperature', updatedData.temperature)
        @render()
      )
      .catch((error) => 
        console.error('Error updating weather data:', error)
      )
  deleteWeatherItem: (event) ->
    console.log("deleting")
    itemId = $(event.currentTarget).data('id')
    modelToDelete = @collection.get(itemId)
    console.log(event.currentTarget)
    if modelToDelete
      modelToDelete.destroy()
    @render()

modelObj = new WeatherItemDataModel()
newview = new view(el: weatherList, collection: collectionObj)
newview.render()

Backbone.sync = (method, model, success, error) ->
  success.success()
