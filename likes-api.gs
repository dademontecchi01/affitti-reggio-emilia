/**
 * Backend like per la mappa Cerco Casa Avidamente.
 * 1) Nel foglio: estensioni → Apps Script, incolla questo file.
 * 2) Crea (se manca) il foglio "Likes" con intestazioni: listingId | person | likedAt
 * 3) Distribuisci → Nuova distribuzione → App web
 *    Esegui come: Me, Chi ha accesso: Chiunque
 * 4) Copia l'URL della distribuzione in LIKES_API_URL in index.html / map.html
 */
var SHEET_NAME = "Likes";
var PEOPLE = ["Bonni", "Ciccio", "Dade"];

function likesSheet_() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, 3).setValues([["listingId", "person", "likedAt"]]);
  }
  return sh;
}

function readLikes_() {
  var sh = likesSheet_();
  var values = sh.getDataRange().getValues();
  var likes = {};
  for (var i = 1; i < values.length; i++) {
    var id = String(values[i][0] || "").trim();
    var person = String(values[i][1] || "").trim();
    if (!id || !person) continue;
    if (!likes[id]) likes[id] = [];
    if (likes[id].indexOf(person) < 0) likes[id].push(person);
  }
  return likes;
}

function applyLike_(id, person, like) {
  if (!id || PEOPLE.indexOf(person) < 0) return false;
  var sh = likesSheet_();
  var values = sh.getDataRange().getValues();
  var found = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === id && String(values[i][1]) === person) {
      found = i + 1;
      break;
    }
  }
  if (like && found < 0) sh.appendRow([id, person, new Date().toISOString()]);
  else if (!like && found > 0) sh.deleteRow(found);
  return true;
}

function doGet(e) {
  e = e || {};
  var p = e.parameter || {};
  if (p.id && p.person) {
    applyLike_(String(p.id).trim(), String(p.person).trim(), String(p.like) === "1" || String(p.like) === "true");
  }
  return ContentService
    .createTextOutput(JSON.stringify({ likes: readLikes_() }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var body = {};
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  } catch (err) {
    body = {};
  }
  var id = String(body.id || "").trim();
  var person = String(body.person || "").trim();
  var like = !!body.like;
  if (!id || PEOPLE.indexOf(person) < 0) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: "bad request" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  var sh = likesSheet_();
  var values = sh.getDataRange().getValues();
  var found = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === id && String(values[i][1]) === person) {
      found = i + 1; // 1-based
      break;
    }
  }
  if (like && found < 0) {
    sh.appendRow([id, person, new Date().toISOString()]);
  } else if (!like && found > 0) {
    sh.deleteRow(found);
  }
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, likes: readLikes_() }))
    .setMimeType(ContentService.MimeType.JSON);
}
