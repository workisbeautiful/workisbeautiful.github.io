var jsVer = "j.3";

var pageLoaded = false;

var lists = [];
var maxListId = -1;
var curList = null;

function clickList(id) {
  curList = getListById(id);
  displayPage("ViewList");
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
      elem("dvListName").innerHTML = curList.name;
      break;
  }
}

function elem(id) {
  return document.getElementById(id);
}

function getListById(id) {
  var i;
  for (i = 0; i<lists.length; i++) {
    if (id == lists[i].id) return lists[i];
  }
  return null;
}

function listFactory(name) {
  var list = {};
  maxListId++;
  list.id = maxListId;
  list.name = name;
  lists.push(list);
  return list;
}

function jsVersion() {
  alert("js version = " + jsVer);
}

function makeNewList() {
  var name = prompt("new list name:","");
  if (!name) return;
  var list = listFactory(name);
  writeListOfLists();
}

function returnToHome() {
  displayPage("Home");
}

function writeListOfLists() {
  var i, html = "", list;
  for (i = 0; i<lists.length; i++){
    if (i>0) html += "<br />\n"
    list = lists[i];
    html += "<a href='javascript:void clickList(\"" + list.id + "\")'>" + list.name + "</a>";
  }
  if (!html) html = "(no lists)";
  elem("dvListOfLists").innerHTML = html;
}

displayPage("Home");
pageLoaded = true;
