const jsVer = "j.0.12";
const sD = "`"; // sD = storageDivider
const CONST_listOfAllLists = "list_of_all_lists";

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

function clearStorage() {
  if (confirm("clear local storage?")) {
    localStorage.clear();
    loadAppData();
    displayPage("Home");
  }
}

function displayPage(pageName) {
  elem("dvPage_Home").style.display = "none";
  elem("dvPage_ViewList").style.display = "none";

  elem("dvPage_" + pageName).style.display = "";

  switch (pageName) {

    case "Home":
      writeListOfLists();  
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

function getItemNameFromStorage(listId, itemId) {
  itemName = getFromStorage(getSaveKeyText_Item(listId, itemId));
  return itemName;
}

function getListNameFromStorage(listId) {
  listName = getFromStorage(getSaveKeyText_List(listId));
  return listName;
}

function getMaxItemIdForList(listId) {
  var listItemsSaveKeyText, text_itemIds, array_itemIds, i, curItemId, curMaxItemId = -1;

  //get save-key-text for this list's list-items
  listItemsSaveKeyText = getSaveKeyText_ListItems(listId);

  //get text of list-item-ids from storage
  text_itemIds = getFromStorage(listItemsSaveKeyText);

  //convert to array
  array_itemIds = getIdArray(text_itemIds);

  //grab max item-id
  for (i = 0; i < array_itemIds.length; i++) {
    curItemId = array_itemIds[i];
    if (curItemId > curMaxItemId) curMaxItemId = curItemId;
  }
  
  return curMaxItemId;
}

function getSaveKeyText_Item(listId, itemId) {
  return "L" + listId + "i" + itemId;
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

function itemFactory(listId, itemName) {
  var curMaxItemId, newItemId, listItemsSaveKeyText, curText_itemsIds, newText_itemsIds;

  //get new list-item-id and manage list-item-id counter
  curMaxItemId = getMaxItemIdForList(listId);
  newItemId = curMaxItemId + 1;

  //save list item to storage
  saveItemToStorage(newItemId, listId, itemName);

  //set new list item values for list
  listItemsSaveKeyText = getSaveKeyText_ListItems(listId);
  curText_itemsIds = getFromStorage(listItemsSaveKeyText);
  if (isBlank(curText_itemsIds)) {
    newText_itemsIds = newItemId;
  } else {
    newText_itemsIds = curText_itemsIds + sD + newItemId;
  }
  saveToStorage(listItemsSaveKeyText, newText_itemsIds);
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
  alert("js version = " + jsVer);
}

function makeNewItem(listId, name) {
  //confirm list name item
  if (!name) name = prompt("new list item:","");
  if (!name) return;

  //create and save list item
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

function saveItemToStorage(itemId, listId, itemName) {
  saveToStorage(getSaveKeyText_Item(itemId), itemName);
}

function saveListOfAllListsToStorage() {
  var textOfListOfAllLists = "", i, curListId;

  for (i = 0; i < app.listIds.length; i++) {
    if (!textOfListOfAllLists) textOfListOfAllLists += sD;
    curListId = app.listIds[i];
    textOfListOfAllLists += curListId;
  }
  
  saveToStorage(CONST_listOfAllLists, textOfListOfAllLists);
}

function saveToStorage(itemKey, itemValue) {
  localStorage.setItem(itemKey, itemValue);
}

function writeItems() {
  var listItemsSaveKeyText, text_itemIds, array_itemIds, i, html = "", curItemId, curItemName;

  //get save-key-text for this list's list-items
  listItemsSaveKeyText = getSaveKeyText_ListItems(app.curListId);

  //get text of list-item-ids from storage
  text_itemIds = getFromStorage(listItemsSaveKeyText);

  //convert to array
  array_itemIds = getIdArray(text_itemIds);

  //loop through array to write list in HTML
  for (i = 0; i < array_itemIds.length; i++){
    if (i > 0) html += "<div style='height:0.6em'></div>\n"
    curItemId = array_itemIds[i];
    curItemName = getItemNameFromStorage(curItemId);
    html += "<div><a href='javascript:void click_item(\"" + curItemId + "\")'>" + curItemName + "</a></div>\n";
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
  alert("--- clicked this item, tbd what happens ---")
}

function click_list(listId) {
  app.curListId = listId;
  displayPage("ViewList");
}

function make_new_item() {
  makeNewItem(app.curListId);
  writeItems();
}

function make_new_list() {
  makeNewList();
  writeListOfLists();
}

function return_to_home() {
  displayPage("Home");
}


///// TEMP ---- seed storage with a list
/*
localStorage.clear();
saveToStorage(CONST_listOfAllLists, "1");
saveToStorage(getSaveKeyText_List(1), "main");
saveToStorage(getSaveKeyText_ListItems(1), "1");
saveToStorage(getSaveKeyText_Item(1), "wib list functional");
*/

///// APP LOAD CODE
function loadAppData() {
  var text_listOfAllLists, array_listOfAllLists, curListId, i;

  //set app-level variables
  app.listIds = [];
  app.maxListId = -1;
  app.curListId = null;

  //grab text of list-of-all-lists from storage
  text_listOfAllLists = getFromStorage(CONST_listOfAllLists);

  //build array from text
  if ( isBlank(text_listOfAllLists) ) {
    array_listOfAllLists = [];
  } else {
    array_listOfAllLists = text_listOfAllLists.split(sD);
    for (i = 0; i < array_listOfAllLists.length; i++) {
      curListId = array_listOfAllLists[i];
      if (curListId > app.maxListId) app.maxListId = curListId;
    }
  }

  //set app array of list-ids
  app.listIds = array_listOfAllLists;
}

loadAppData();

displayPage("Home");

pageLoaded = true;
