const CONST_appVersion = "0.16";
const sD = "`"; // sD = storageDivider
const CONST_listOfAllLists = "list_of_all_lists";
const CONST_storedDataVersion = "stored_data_version";

var pageLoaded = false;

var app = {};


/*

example list-of-all-lists in text format
>>>  KEY    =  list_of_all_lists
>>>  VALUE  =  1`2

example list in text format:
>>>  KEY    =  list_1
>>>  VALUE  =  test list 1

example list-items in text format:
>>>  KEY    =  listItems_1
>>>  VALUE  =  1`2`3`4

example list-item in text format:
>>>  KEY    =  L1i1
>>>  VALUE  =  test item 1

*/


function addToListOfAllLists(listIdToAdd) {
  app.listIds.push(listIdToAdd);
  saveListOfAllListsToStorage();
}

function changeItem(listId, itemId, newItemName, newDone) {
  saveItemToStorage(listId, itemId, newItemName, newDone)  
}

function clearStorage() {
  if (confirm("clear local storage?")) {
    localStorage.clear();
    loadAppData();
    displayPage("Home");
  }
}

function createItemInfoString(itemName, done) {
  var itemInfoString = itemName + sD;

  if ( isBlank(done) ) {
    itemInfoString += "0";
  } else {
    if ( done == "1" ) {
      itemInfoString += "1";
    } else {
      itemInfoString += "0";
    }
  }

  return itemInfoString;
}

function deleteFromStorage(itemKey) {
  localStorage.removeItem(itemKey);
}

function deleteItem(listId, itemIdToBeDeleted) {
  var itemSaveKeyText, listItemsSaveKeyText, curText_itemsIds, curArray_itemsIds, i, curArrayItemId, newText_itemIds = "";

  //delete the item from storage
  itemSaveKeyText = getSaveKeyText_Item(listId, itemIdToBeDeleted);
  deleteFromStorage(itemSaveKeyText);

  //clear app-level current-item-id
  app.curItemId = null;

  //get current list-item values for list
  listItemsSaveKeyText = getSaveKeyText_ListItems(listId);
  curText_itemsIds = getFromStorage(listItemsSaveKeyText);

  //convert current text-of-list-items to array
  curArray_itemsIds = curText_itemsIds.split(sD);

  //cycle through current list-items array
  for ( i = 0; i < curArray_itemsIds.length; i++) {
    curArrayItemId = curArray_itemsIds[i];
    
    //compare each existing list-item to the item-to-be-deleted
    if ( !isEqual(curArrayItemId, itemIdToBeDeleted) ) {

      //if match is not found, this is NOT our target list-item, so we can write to the current array item-id to the new text for list-items
      if ( !isBlank(newText_itemIds) ) newText_itemIds += sD
      newText_itemIds += curArrayItemId
    }
  }

  //save the edited text-of-list-items to storage
  saveToStorage(listItemsSaveKeyText, newText_itemIds);
}

function displayPage(pageName) {
  var itemInfoObject;

  elem("dvPage_Home").style.display = "none";
  elem("dvPage_ViewItem").style.display = "none";
  elem("dvPage_ViewList").style.display = "none";

  elem("dvPage_" + pageName).style.display = "";

  switch (pageName) {

    case "Home":
      writeListOfLists();  
      break;

    case "ViewItem":
      itemInfoObject = getItemInfoObjectFromStorage(app.curListId, app.curItemId);
      elem("dvItemName").innerHTML = itemInfoObject.itemName;
      elem("dvListNameForItem").innerHTML = "( " + getListNameFromStorage(app.curListId) + " )";
      if (itemInfoObject.done == "0") {
        elem("dvPage_ViewItem_NotDone").style.display = "";
        elem("dvPage_ViewItem_Done").style.display = "none";
      } else {
        elem("dvPage_ViewItem_NotDone").style.display = "none";
        elem("dvPage_ViewItem_Done").style.display = "";
      }

      break;

    case "ViewList":
      elem("dvListName").innerHTML = getListNameFromStorage(app.curListId);
      writeItems();
      break;
  }
}

function elem(id) {
  return document.getElementById(id);
}

function getFromStorage(itemKey) {
  var itemValue = localStorage.getItem(itemKey);
  return itemValue;
}

function getIdArray(text_ids){
  var array_ids;
  if (isBlank(text_ids)) return [];
  array_itemIds = text_ids.split(sD);
  return array_itemIds;
}

function getItemIdArrayForList(listId) {
  var listItemsSaveKeyText, text_itemIds;

  //get save-key-text for this list's list-items
  listItemsSaveKeyText = getSaveKeyText_ListItems(listId);

  //get text of list-item-ids from storage
  text_itemIds = getFromStorage(listItemsSaveKeyText);

  //convert to array and return
  return getIdArray(text_itemIds);
}

function getItemInfoObjectFromStorage(listId, itemId) {
  var itemInfoObj, itemInfoString, itemInfoArray;

  //set item-info-object to a new object
  itemInfoObj = {};

  //get the item-info-string from storage
  itemInfoString = getItemInfoStringFromStorage(listId, itemId);

  //split the item-info-string into an array
  itemInfoArray = itemInfoString.split(sD);

  //set item-info-object's properties from the string
  itemInfoObj.itemName = itemInfoArray[0];
  itemInfoObj.done = itemInfoArray[1];

  //return the object that has been populated with item-info values
  return itemInfoObj;
}

function getItemInfoStringFromStorage(listId, itemId) {
  return getFromStorage(getSaveKeyText_Item(listId, itemId));
}

function getListNameFromStorage(listId) {
  listName = getFromStorage(getSaveKeyText_List(listId));
  return listName;
}

function getMaxItemIdForList(listId) {
  var array_itemIds, i, curItemId, curMaxItemId = -1;

  array_itemIds = getItemIdArrayForList(listId);

  //grab max item-id
  for (i = 0; i < array_itemIds.length; i++) {
    curItemId = array_itemIds[i];
    if (curItemId > curMaxItemId) curMaxItemId = curItemId;
  }
  
  return curMaxItemId;
}

function getSaveKeyText_Item(listId, itemId) {
  return listId + "_" + itemId;
}

function getSaveKeyText_List(listId) {
  return "list_" + listId;
}

function getSaveKeyText_ListItems(listId) {
  return "listItems_" + listId;
}

function isBlank(val) {
  if(val == undefined) return true;
  if(val == null) return true;
  if(val == "") return true;
  if(val == 0)return false;
  if(!val)return true;
  return false;
}

function isEqual(val1, val2) {
  if ( isBlank(val1) && isBlank(val2) ) return true;
  if ( val1 == val2 ) return true;
  if ( Number(val1) == Number(val2) ) return true;
  return false;
}

function itemFactory(listId, itemName) {
  var curMaxItemId, newItemId, listItemsSaveKeyText, curText_itemsIds, newText_itemIds = "";

  //get new list-item-id and manage list-item-id counter
  curMaxItemId = getMaxItemIdForList(listId);
  newItemId = curMaxItemId + 1;

  //save item to storage
  saveItemToStorage(listId, newItemId, itemName, "0");

  //set new list item values for list
  listItemsSaveKeyText = getSaveKeyText_ListItems(listId);
  curText_itemsIds = getFromStorage(listItemsSaveKeyText);
  if (isBlank(curText_itemsIds)) {
    newText_itemIds = newItemId;
  } else {
    newText_itemIds = curText_itemsIds + sD + newItemId;
  }
  saveToStorage(listItemsSaveKeyText, newText_itemIds);
}

function listFactory(listName) {
  var listId;

  //get new list-id and manage list-id counter
  app.maxListId++;
  listId = app.maxListId;

  //save list to storage
  saveListInfoToStorage(listId, listName);

  //change list-of-all-lists
  addToListOfAllLists(listId);
}

function jsVersion() {
  alert("version in app code = " + CONST_appVersion);
}

function makeNewItem(listId, name) {
  //confirm list name item
  if (!name) name = prompt("new list item:","");
  if (!name) return;

  //create and save item
  itemFactory(listId, name);
}

function makeNewList(name) {
  //confirm list name
  if (!name) name = prompt("new list name:","");
  if (!name) return;

  //create and save list
  listFactory(name);
}

function saveListInfoToStorage(listId, listName, text_itemIds) {
  //save list's top level info
  saveToStorage(getSaveKeyText_List(listId), listName);

  // if present, save list's list-of-item-ids
  saveListItemIdsToStorage(listId, text_itemIds);
}

function saveListItemIdsToStorage(listId, text_itemIds) {
  if (isBlank(text_itemIds)) {
    saveToStorage(getSaveKeyText_ListItems(listId), "");
  } else {
    saveToStorage(getSaveKeyText_ListItems(listId), text_itemIds);
  }
}

function saveItemToStorage(listId, itemId, itemName, done) {
  var itemInfoString = createItemInfoString(itemName, done);
  saveToStorage(getSaveKeyText_Item(listId, itemId), itemInfoString);
}

function saveListOfAllListsToStorage() {
  var textOfListOfAllLists = "", i, curListId;

  for (i = 0; i < app.listIds.length; i++) {
    if ( ! isBlank(textOfListOfAllLists) ) textOfListOfAllLists += sD;
    curListId = app.listIds[i];
    textOfListOfAllLists += curListId;
  }
  
  saveToStorage(CONST_listOfAllLists, textOfListOfAllLists);
}

function saveToStorage(itemKey, itemValue) {
  localStorage.setItem(itemKey, itemValue);
}

function writeItems() {
  var array_itemIds, i, html = "", curItemId, curItemInfoObj;

  //get array of item-ids for the current app-list
  array_itemIds = getItemIdArrayForList(app.curListId);

  //loop through array to write list in HTML
  for (i = 0; i < array_itemIds.length; i++){
    if (i > 0) html += "<div style='height:0.6em'></div>\n"
    curItemId = array_itemIds[i];

    //call the function that grabs the current item's item-info from storage and returns it as a js-object
    curItemInfoObj = getItemInfoObjectFromStorage(app.curListId, curItemId);

    //set html based on item-info values stored as properties of the item-info-js-object
    html += "<div><a" ;
    if (curItemInfoObj.done == "1") html += " class='green'";
    html += " href='javascript:void click_item(\"" + curItemId + "\")'>" + curItemInfoObj.itemName + "</a></div>\n";
  }
  if (isBlank(html)) html = "(no items)";

  //write to screen
  elem("dvItems").innerHTML = html;
}

function writeListOfLists() {
  var i, html = "", curListId, curListName;

  for (i = 0; i < app.listIds.length; i++){
    if (i > 0) html += "<div style='height:0.6em'></div>\n"
    curListId = app.listIds[i];
    curListName = getListNameFromStorage(curListId);
    html += "<div><a href='javascript:void click_list(\"" + curListId + "\")'>" + curListName + "</a></div>";
  }
  if (isBlank(html)) html = "(no lists)";
  elem("dvListOfLists").innerHTML = html;
}


///// FUNCTIONS FROM HTML PAGE

function click_item(itemId) {
  go_to_item(itemId);
}

function click_list(listId) {
  go_to_list(listId);
}

function delete_item() {
  if ( confirm("Delete this item?") ) {
    deleteItem(app.curListId, app.curItemId);
    go_to_list(app.curListId);
  }
}

function go_to_item(itemId) {
  app.curItemId = itemId;
  displayPage("ViewItem");
}

function go_to_list(listId) {
  app.curListId = listId;
  displayPage("ViewList");
}

function mark_item_as_done() {
  var curItemObj = getItemInfoObjectFromStorage(app.curListId, app.curItemId);
  changeItem(app.curListId, app.curItemId, curItemObj.itemName, "1");
  go_to_item(app.curItemId);
}

function make_new_item() {
  makeNewItem(app.curListId);
  writeItems();
}

function make_new_list() {
  makeNewList();
  writeListOfLists();
}

function rename_item() {
  var curItemObj = getItemInfoObjectFromStorage(app.curListId, app.curItemId);
  var editedItemName = prompt("Change item name to:", curItemObj.itemName);
  if ( isBlank(editedItemName)) return;
  changeItem(app.curListId, app.curItemId, editedItemName, curItemObj.done);
  go_to_item(app.curItemId);
}

function return_to_home() {
  displayPage("Home");
}

function return_to_list() {
  go_to_list(app.curListId);
}

function unmark_item_as_done() {
  var curItemObj = getItemInfoObjectFromStorage(app.curListId, app.curItemId);
  changeItem(app.curListId, app.curItemId, curItemObj.itemName, "0");
  go_to_item(app.curItemId);
}


///// TEMP ---- seed storage with a list
/*
localStorage.clear();
saveToStorage(CONST_listOfAllLists, "1");
saveToStorage(getSaveKeyText_List(1), "main");
saveToStorage(getSaveKeyText_ListItems(1), "1");
saveToStorage(getSaveKeyText_Item(1, 1), "wib list functional");
*/


///// LOAD APP-LEVEL DATA FROM STORAGE
function loadAppData() {
  var text_listOfAllLists, curListId, i;

  //reset to starting values for app-level variables
  app.listIds = null
  app.maxListId = -1;
  app.curListId = null;
  app.curItemId = null;

  //grab text of list-of-all-lists from storage
  text_listOfAllLists = getFromStorage(CONST_listOfAllLists);

  if ( isBlank(text_listOfAllLists) ) {

    //if text list-of-all-lists DOES NOT exist, set the app-level list-of-all-lists array to an empty array
    app.listIds = [];

  } else {

    //if text list-of-all-lists DOES exist ... 

    // ... (1) populate the app-level list-of-all-lists array by splitting the list-of-all-lists text that was pulled from storage  
    app.listIds = text_listOfAllLists.split(sD);

    // ... (2) cycle through the new array and set app.maxListId
    for (i = 0; i < app.listIds.length; i++) {
      curListId = app.listIds[i];
      if (curListId > app.maxListId) app.maxListId = curListId;
    }
  }

  //update stored-data
  upgradeStoredData();
}

function upgradeStoredData() {
  var appVersion_array, appVersion_major, appVersion_minor;
  var storedDataVersion_text, storedDataVersion_array, storedDataVersion_major, storedDataVersion_minor;

  //split app-version into major and minor
  appVersion_array = CONST_appVersion.split(".");
  appVersion_major = Number(appVersion_array[0]);
  appVersion_minor = Number(appVersion_array[1]);

  //establish existing version of the stored data
  storedDataVersion_text = getFromStorage(CONST_storedDataVersion);
  if ( isBlank(storedDataVersion_text) ) storedDataVersion_text = "0.0";
  
  //split stored-data-version into major and minor
  storedDataVersion_array = storedDataVersion_text.split(".");
  storedDataVersion_major =  Number(storedDataVersion_array[0]);
  storedDataVersion_minor =  Number(storedDataVersion_array[1]);

  //warning if major version differs
  if ( !isEqual(appVersion_major, storedDataVersion_major) ) {
    alert("WARNING: app version is " + appVersion_major + ", stored data version is " + storedDataVersion_major + " ... no automatic data update available yet for major version upgrades");
    return;
  }

  if (appVersion_minor >= 15 && storedDataVersion_minor < 15) {
    //upgrade from pre-0.15 to 0.15
    upgradeStoredData_0_15();
  }
}

function upgradeStoredData_0_15() {
  var i, j, curListId, curItemIds, curItemId, curItemInfoString, newItemInfoString;

  //cycle through each list
  for (i = 0; i < app.listIds.length; i++) {
    curListId = app.listIds[i];
    
    //get array of item-ids for the current list
    curItemIds = getItemIdArrayForList(curListId);

    //loop through array of item-ids to upgrade each item's stored-data
    for (j = 0; j < curItemIds.length; j++){
      curItemId = curItemIds[j];

      //get existing item-info-string (which will be just itemName)
      curItemInfoString = getItemInfoStringFromStorage(curListId, curItemId);

      //add the 'done' value of '0' to the string
      newItemInfoString = curItemInfoString + sD + "0";

      //save the revised string to storage
      saveToStorage(getSaveKeyText_Item(curListId, curItemId), newItemInfoString);
    }
  }

  //update the stored-data's version to 0.15
  saveToStorage(CONST_storedDataVersion, "0.15");
}

loadAppData();


///// LOAD HOME PAGE

displayPage("Home");

pageLoaded = true;
